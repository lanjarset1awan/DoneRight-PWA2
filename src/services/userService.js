// ---------------------------------------------------------------------------
// userService.js — Student profile management with localStorage persistence
// and direct Supabase database synchronization.
// Fulfills Modul 5 requirement: Profile page containing Nama, NIM, Kelompok.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import syncService from "./syncService";

const PROFILE_KEY = "doneright_student_profile";
const TOKEN_KEY = "token";

const DEFAULT_PROFILE = {
  id_users: 32,
  username: "lanjar",
  nama: "Lanjar Setiawan",
  nim: "21120122140123",
  kelompok: "Kelompok 05",
  prodi: "Teknik Komputer",
  email: "setiawanlanjar2@gmail.com",
  role: "user",
  avatar: "https://mmdrzvvnmoplbdfaiixx.supabase.co/storage/v1/object/public/avatar/32/avatar.png",
  bio: "Praktikum Pemrograman Perangkat Bergerak - PWA 2",
};

class UserService {
  getUserProfile() {
    try {
      const stored = localStorage.getItem(PROFILE_KEY) || localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          id_users: parsed.id_users || DEFAULT_PROFILE.id_users,
          nama: parsed.nama || parsed.username || DEFAULT_PROFILE.nama,
          nim: parsed.nim || DEFAULT_PROFILE.nim,
          kelompok: parsed.kelompok || DEFAULT_PROFILE.kelompok,
        };
      }
    } catch (err) {
      console.warn("Failed to parse stored profile, using default:", err);
    }
    this.saveUserProfile(DEFAULT_PROFILE);
    return DEFAULT_PROFILE;
  }

  saveUserProfile(profileData) {
    try {
      const current = this.getUserProfile();
      const updated = {
        ...current,
        ...profileData,
        id_users: profileData.id_users || current.id_users || DEFAULT_PROFILE.id_users,
        username: profileData.username || profileData.nama || current.username,
        nama: profileData.nama || profileData.username || current.nama,
        nim: profileData.nim || current.nim,
        kelompok: profileData.kelompok || current.kelompok,
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
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const current = this.getUserProfile();

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id_users, username, email, role, created_at, avatar, nama, nim, kelompok")
          .eq("id_users", current.id_users || 32)
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
    const current = this.getUserProfile();

    const payload = {
      nama: profileData.nama || current.nama,
      nim: profileData.nim || current.nim,
      kelompok: profileData.kelompok || current.kelompok,
      username: profileData.username || current.username,
      email: profileData.email || current.email,
    };

    if (profileData.avatar) {
      payload.avatar = profileData.avatar;
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

  updateAvatar(avatarBase64) {
    const profile = this.getUserProfile();
    profile.avatar = avatarBase64;
    this.saveUserProfile(profile);
    return this.updateProfileRemote(profile);
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "doneright-pwa2-offline-token";
  }

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default new UserService();
