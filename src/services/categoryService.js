// ---------------------------------------------------------------------------
// categoryService.js — Category CRUD with direct Supabase BaaS + offline localStorage
// and syncQueue support.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import userService from "./userService";
import syncService from "./syncService";

const CATEGORIES_KEY = "doneright_categories";

const DEFAULT_CATEGORIES = [
  { id_categories: 1, name: "Mata Kuliah", is_global: true },
  { id_categories: 2, name: "Praktikum", is_global: true },
  { id_categories: 3, name: "Projek Akhir", is_global: true },
  { id_categories: 4, name: "Skripsi", is_global: true },
  { id_categories: 5, name: "Organisasi", is_global: true },
];

class CategoryService {
  getLocalCategories() {
    try {
      const stored = localStorage.getItem(CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local categories:", e);
    }
    this.saveLocalCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }

  saveLocalCategories(categories) {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn("Storage quota exceeded or error:", e);
    }
  }

  _getUserId() {
    const user = userService.getUserProfile();
    return user.id_users || 32;
  }

  async getCategories() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .or(`is_global.eq.true,user_id.eq.${userId}`)
          .order("name", { ascending: true });

        if (!error && Array.isArray(data)) {
          this.saveLocalCategories(data);
          return data;
        }
      } catch (err) {
        console.warn("Categories Supabase query error, using local storage fallback:", err.message);
      }
    }
    return this.getLocalCategories();
  }

  async createCategory(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) throw new Error("Nama kategori wajib diisi!");

    const userId = this._getUserId();
    const localId = Date.now();
    const newCategory = {
      id_categories: localId,
      user_id: userId,
      name: trimmed,
      is_global: false,
    };

    const current = this.getLocalCategories();
    this.saveLocalCategories([...current, newCategory]);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { data: serverCat, error } = await supabase
          .from("categories")
          .insert([
            {
              user_id: userId,
              name: trimmed,
              is_global: false,
            },
          ])
          .select()
          .single();

        if (!error && serverCat) {
          const updated = this.getLocalCategories().map((c) =>
            String(c.id_categories) === String(localId) ? { ...c, ...serverCat } : c
          );
          this.saveLocalCategories(updated);
          return serverCat;
        }
      } catch (err) {
        console.warn("Remote createCategory failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "CREATE_CATEGORY",
          payload: { user_id: userId, name: trimmed, is_global: false },
          localId,
        });
        return newCategory;
      }
    }

    syncService.enqueue({
      type: "CREATE_CATEGORY",
      payload: { user_id: userId, name: trimmed, is_global: false },
      localId,
    });
    return newCategory;
  }

  async updateCategory(id, name) {
    const trimmed = (name || "").trim();
    if (!trimmed) throw new Error("Nama kategori wajib diisi!");

    const current = this.getLocalCategories();
    const next = current.map((c) =>
      String(c.id_categories) === String(id) ? { ...c, name: trimmed } : c
    );
    this.saveLocalCategories(next);
    const updated = { id_categories: id, name: trimmed };

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { data: serverCat, error } = await supabase
          .from("categories")
          .update({ name: trimmed })
          .eq("id_categories", id)
          .select()
          .single();

        return (!error && serverCat) || updated;
      } catch (err) {
        console.warn("Remote updateCategory failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "UPDATE_CATEGORY",
          targetId: id,
          payload: { name: trimmed },
        });
        return updated;
      }
    }

    syncService.enqueue({
      type: "UPDATE_CATEGORY",
      targetId: id,
      payload: { name: trimmed },
    });
    return updated;
  }

  async deleteCategory(id, mode = "keep_tasks") {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        if (mode === "delete_tasks") {
          await supabase
            .from("tasks")
            .update({ deleted_at: new Date().toISOString() })
            .eq("category_id", id);
        } else {
          await supabase
            .from("tasks")
            .update({ category_id: null })
            .eq("category_id", id);
        }
        await supabase.from("categories").delete().eq("id_categories", id);
      } catch (err) {
        console.warn("Remote deleteCategory failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "DELETE_CATEGORY",
          targetId: id,
        });
      }
    } else {
      syncService.enqueue({
        type: "DELETE_CATEGORY",
        targetId: id,
      });
    }

    const current = this.getLocalCategories();
    const next = current.filter((c) => String(c.id_categories) !== String(id));
    this.saveLocalCategories(next);

    try {
      const storedTasks = localStorage.getItem("doneright_tasks");
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        let updatedTasks;
        if (mode === "delete_tasks") {
          updatedTasks = tasks.map((t) =>
            String(t.category_id) === String(id)
              ? { ...t, deleted_at: new Date().toISOString() }
              : t
          );
        } else {
          updatedTasks = tasks.map((t) =>
            String(t.category_id) === String(id)
              ? { ...t, category_id: null, category_name: null }
              : t
          );
        }
        localStorage.setItem("doneright_tasks", JSON.stringify(updatedTasks));
      }
    } catch (e) {
      console.warn("Error updating tasks on category delete:", e);
    }

    return { success: true };
  }
}

export default new CategoryService();
