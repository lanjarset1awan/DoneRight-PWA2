// ---------------------------------------------------------------------------
// userService.js — Student profile management with localStorage persistence
// and direct Supabase database synchronization.
// Fulfills Modul 5 requirement: Profile page containing Nama, NIM, Kelompok.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import syncService from "./syncService";

const PROFILE_KEY = "doneright_student_profile";
const TOKEN_KEY = "token";

class UserService {
  getUserProfile() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }
      const stored = localStorage.getItem(PROFILE_KEY) || localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          id_users: parsed.id_users,
          username: parsed.username || "pengguna",
          nama: parsed.nama || parsed.username || "Pengguna",
          nim: parsed.nim || "",
          kelompok: parsed.kelompok || "",
          prodi: parsed.prodi || "",
          email: parsed.email || "",
          role: parsed.role || "user",
          avatar: parsed.avatar || "",
          bio: parsed.bio || "",
          ...parsed,
        };
      }
    } catch (err) {
      console.warn("Failed to parse stored profile:", err);
    }
    return null;
  }

  saveUserProfile(profileData) {
    if (!profileData) return { success: false };
    try {
      const current = this.getUserProfile() || {};
      const updated = {
        ...current,
        ...profileData,
        id_users: profileData.id_users || current.id_users,
        username: profileData.username || profileData.nama || current.username || "",
        nama: profileData.nama || profileData.username || current.nama || "",
        nim: profileData.nim !== undefined ? profileData.nim : current.nim || "",
        kelompok: profileData.kelompok !== undefined ? profileData.kelompok : current.kelompok || "",
        prodi: profileData.prodi !== undefined ? profileData.prodi : current.prodi || "",
        email: profileData.email || current.email || "",
        role: profileData.role || current.role || "user",
        avatar: profileData.avatar !== undefined ? profileData.avatar : current.avatar,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      localStorage.setItem("user", JSON.stringify(updated));
      return { success: true, data: updated };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async fetchProfile() {
    const current = this.getUserProfile();
    if (!current || !current.id_users) {
      return null;
    }
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id_users, username, email, role, created_at, avatar, nama, nim, kelompok")
          .eq("id_users", current.id_users)
          .single();

        if (!error && data) {
          this.saveUserProfile(data);
          return this.getUserProfile();
        }
      } catch (e) {
        console.warn("Fetch remote profile error, using local:", e.message);
      }
    }
    return current;
  }

  async updateProfileRemote(profileData) {
    const localResult = this.saveUserProfile(profileData);
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const current = this.getUserProfile() || {};

    const payload = {
      nama: profileData.nama || current.nama,
      nim: profileData.nim || current.nim,
      kelompok: profileData.kelompok || current.kelompok,
      username: profileData.username || current.username,
      email: profileData.email || current.email,
    };

    if (profileData.avatar !== undefined) {
      payload.avatar = profileData.avatar ? profileData.avatar : null;
    }

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("users")
          .update(payload)
          .eq("id_users", current.id_users || 32)
          .select()
          .single();

        if (!error && data) {
          this.saveUserProfile(data);
          return { success: true, data };
        }
      } catch (err) {
        console.warn("Remote profile update failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "UPDATE_PROFILE",
          payload,
          targetId: current.id_users || 32,
        });
        return localResult;
      }
    }

    syncService.enqueue({
      type: "UPDATE_PROFILE",
      payload,
      targetId: current.id_users || 32,
    });
    return localResult;
  }

  async uploadAvatar(fileOrBase64, userId) {
    if (!fileOrBase64) return { success: false, message: "Berkas gambar tidak ditemukan." };
    const current = this.getUserProfile() || {};
    const id = userId || current?.id_users || 32;

    let blob;
    let fileExt = "png";
    let contentType = "image/png";

    if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
      const parts = fileOrBase64.split(";base64,");
      contentType = parts[0]?.split(":")[1] || "image/png";
      fileExt = contentType.split("/")[1] || "png";
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      blob = new Blob([uInt8Array], { type: contentType });
    } else if (fileOrBase64 instanceof Blob || fileOrBase64 instanceof File) {
      blob = fileOrBase64;
      contentType = fileOrBase64.type || "image/png";
      fileExt = fileOrBase64.name ? fileOrBase64.name.split(".").pop().toLowerCase() : (contentType.split("/")[1] || "png");
    } else {
      return { success: false, message: "Format avatar tidak valid." };
    }

    const fileName = `avatar.${fileExt}`;
    const filePath = `${id}/${fileName}`;
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { error: uploadError } = await supabase.storage
          .from("avatar")
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: true,
            contentType,
          });

        if (uploadError) {
          console.error("Supabase storage upload error:", uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("avatar")
          .getPublicUrl(filePath);

        const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        // Perbarui kolom avatar di tabel users Supabase
        await supabase
          .from("users")
          .update({ avatar: publicUrl })
          .eq("id_users", id);

        this.saveUserProfile({ avatar: publicUrl });
        return { success: true, avatarUrl: publicUrl };
      } catch (err) {
        console.warn("Upload ke Supabase storage gagal, beralih ke sinkronisasi offline:", err.message);
      }
    }

    // Jika offline: simpan base64 lokal & masukkan ke antrean sinkronisasi
    let base64String = "";
    if (typeof fileOrBase64 === "string") {
      base64String = fileOrBase64;
    } else {
      base64String = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }

    this.saveUserProfile({ avatar: base64String });
    syncService.enqueue({
      type: "UPLOAD_AVATAR",
      payload: { base64: base64String },
      targetId: id,
    });

    return { success: true, avatarUrl: base64String };
  }

  async deleteAvatar(userId) {
    const current = this.getUserProfile() || {};
    const id = userId || current?.id_users || 32;
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        await supabase.storage
          .from("avatar")
          .remove([`${id}/avatar.png`, `${id}/avatar.jpg`, `${id}/avatar.jpeg`, `${id}/avatar.webp`]);

        await supabase
          .from("users")
          .update({ avatar: null })
          .eq("id_users", id);
      } catch (err) {
        console.warn("Hapus avatar dari storage gagal:", err.message);
      }
    } else {
      syncService.enqueue({
        type: "DELETE_AVATAR",
        payload: {},
        targetId: id,
      });
    }

    this.saveUserProfile({ avatar: "" });
    return { success: true };
  }

  updateAvatar(fileOrBase64, userId) {
    if (!fileOrBase64) {
      return this.deleteAvatar(userId);
    }
    return this.uploadAvatar(fileOrBase64, userId);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("doneright_tasks");
    localStorage.removeItem("doneright_categories");
    localStorage.removeItem("doneright_notifications");
  }

  async deleteAccount(userId) {
    const current = this.getUserProfile();
    const id = userId || current?.id_users;
    if (!id) {
      this.logout();
      return { success: true };
    }

    const nowIso = new Date().toISOString();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { error } = await supabase
          .from("users")
          .update({ deleted_at: nowIso })
          .eq("id_users", id);

        if (error) throw error;
      } catch (err) {
        console.warn("Soft delete user remote failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "DELETE_USER",
          payload: { deleted_at: nowIso },
          targetId: id,
        });
      }
    } else {
      syncService.enqueue({
        type: "DELETE_USER",
        payload: { deleted_at: nowIso },
        targetId: id,
      });
    }

    this.logout();
    return { success: true };
  }
}

export default new UserService();
