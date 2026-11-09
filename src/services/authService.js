// ---------------------------------------------------------------------------
// authService.js — Direct Supabase Authentication with offline fallback
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import userService from "./userService";

class AuthService {
  async login(email, password) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline && email) {
      try {
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email.trim().toLowerCase())
          .single();

        if (!error && user) {
          const token = `supabase-token-${user.id_users}-${Date.now()}`;
          userService.setToken(token);
          userService.saveUserProfile(user);
          return { success: true, token, user };
        }
      } catch (err) {
        console.warn("Online Supabase login check failed, falling back to local:", err.message);
      }
    }

    // Offline / Demo student login fallback
    const currentProfile = userService.getUserProfile();
    const token = "doneright-pwa2-offline-token";
    userService.setToken(token);

    const updated = {
      ...currentProfile,
      email: email ? email.trim() : currentProfile.email,
    };
    userService.saveUserProfile(updated);

    return {
      success: true,
      token,
      user: updated,
    };
  }

  async register(username, email, password) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    const trimmedUser = (username || "Mahasiswa").trim();
    const trimmedEmail = (email || "mahasiswa@student.undip.ac.id").trim().toLowerCase();

    if (isOnline) {
      try {
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
            },
          ])
          .select()
          .single();

        if (!error && newUser) {
          const token = `supabase-token-${newUser.id_users}-${Date.now()}`;
          userService.setToken(token);
          userService.saveUserProfile(newUser);
          return {
            success: true,
            message: "Registrasi berhasil dan tersimpan di database Supabase.",
            token,
            user: newUser,
          };
        }
      } catch (err) {
        console.warn("Online Supabase register failed, creating local profile:", err.message);
      }
    }

    // Local registration fallback
    const newProfile = {
      ...userService.getUserProfile(),
      username: trimmedUser,
      nama: trimmedUser,
      email: trimmedEmail,
    };
    userService.saveUserProfile(newProfile);
    const token = "doneright-pwa2-offline-token";
    userService.setToken(token);

    return {
      success: true,
      message: "Registrasi berhasil (Tersimpan di penyimpanan lokal).",
      token,
      user: newProfile,
    };
  }

  logout() {
    userService.logout();
  }
}

export default new AuthService();
