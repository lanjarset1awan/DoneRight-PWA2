// ---------------------------------------------------------------------------
// authService.js — Direct Supabase Authentication with offline fallback
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import userService from "./userService";

class AuthService {
  async login(email, password) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi!" };
    }

    const cleanInput = email.trim().toLowerCase();

    if (isOnline) {
      try {
        let query = supabase.from("users").select("*");
        if (cleanInput.includes("@")) {
          query = query.eq("email", cleanInput);
        } else {
          query = query.eq("username", cleanInput);
        }

        const { data: user, error } = await query.maybeSingle();

        if (error || !user) {
          return {
            success: false,
            message: "Akun tidak ditemukan. Silakan periksa kembali email atau daftar akun terlebih dahulu.",
          };
        }

        const token = `supabase-token-${user.id_users}-${Date.now()}`;
        userService.setToken(token);
        userService.saveUserProfile(user);
        return { success: true, token, user };
      } catch (err) {
        console.warn("Online Supabase login check failed:", err.message);
        return {
          success: false,
          message: "Gagal terhubung ke database. Periksa koneksi internet Anda.",
        };
      }
    }

    // Offline / Local fallback: only allow if user previously logged in on this device
    const currentProfile = userService.getUserProfile();
    if (
      currentProfile &&
      (currentProfile.email?.toLowerCase() === cleanInput ||
        currentProfile.username?.toLowerCase() === cleanInput)
    ) {
      const token = userService.getToken() || `offline-token-${currentProfile.id_users}`;
      userService.setToken(token);
      return {
        success: true,
        token,
        user: currentProfile,
      };
    }

    return {
      success: false,
      message: "Sedang offline: hanya akun yang tersimpan di perangkat ini yang dapat masuk.",
    };
  }

  async register(username, email, password) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    const trimmedUser = (username || "Mahasiswa").trim();
    const trimmedEmail = (email || "").trim().toLowerCase();

    if (!trimmedEmail) {
      return { success: false, message: "Email wajib diisi!" };
    }

    if (isOnline) {
      try {
        // Check if email already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id_users")
          .eq("email", trimmedEmail)
          .maybeSingle();

        if (existingUser) {
          return {
            success: false,
            message: "Email sudah terdaftar. Silakan gunakan email lain atau langsung masuk di halaman Login.",
          };
        }

        // Insert new user into Supabase users table
        const { data: newUser, error } = await supabase
          .from("users")
          .insert([
            {
              username: trimmedUser,
              email: trimmedEmail,
              nama: trimmedUser,
              is_verified: true,
              role: "user",
              password_hash: password ? btoa(password) : null,
            },
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        if (newUser) {
          const token = `supabase-token-${newUser.id_users}-${Date.now()}`;
          userService.setToken(token);
          userService.saveUserProfile(newUser);
          return {
            success: true,
            message: "Registrasi berhasil! Akun Anda telah tersimpan di database Supabase.",
            token,
            user: newUser,
          };
        }
      } catch (err) {
        console.error("Online Supabase register failed:", err.message);
        return {
          success: false,
          message: err.message || "Gagal melakukan registrasi di database.",
        };
      }
    }

    return {
      success: false,
      message: "Registrasi membutuhkan koneksi internet untuk menyimpan akun ke database.",
    };
  }

  logout() {
    userService.logout();
  }
}

export default new AuthService();
