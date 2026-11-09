// ---------------------------------------------------------------------------
// taskService.js — Task CRUD with direct Supabase BaaS + offline localStorage persistence
// with background synchronization queue support.
// Supports: Create, Read, Update, Delete, Toggle Complete, Trash, Restore.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import categoryService from "./categoryService";
import userService from "./userService";
import syncService from "./syncService";

const TASKS_KEY = "doneright_tasks";

const relativeDate = (daysAhead, hours = 23, minutes = 59) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const DEFAULT_TASKS = [
  {
    id_tasks: 101,
    title: "Implementasi Service Worker & Manifest PWA II",
    description: "Konfigurasi vite-plugin-pwa, cache offline, dan icon splash screen.",
    category_id: 2,
    category_name: "Praktikum",
    priority: "high",
    deadline: relativeDate(1, 23, 59),
    is_completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    deleted_at: null,
  },
  {
    id_tasks: 102,
    title: "Laporan Praktikum Pemrograman Perangkat Bergerak",
    description: "Membuat dokumentasi implementasi modul 6 PWA 2 dan deployment Vercel.",
    category_id: 2,
    category_name: "Praktikum",
    priority: "high",
    deadline: relativeDate(2, 17, 0),
    is_completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    deleted_at: null,
  },
  {
    id_tasks: 103,
    title: "Review Materi Single Page Application (SPA)",
    description: "Mempelajari state management, useEffect, custom hooks, dan localStorage.",
    category_id: 1,
    category_name: "Tugas Kuliah",
    priority: "medium",
    deadline: relativeDate(4, 12, 0),
    is_completed: true,
    completed_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    deleted_at: null,
  },
];

class TaskService {
  getLocalTasks() {
    try {
      const stored = localStorage.getItem(TASKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error reading local tasks:", e);
    }
    this.saveLocalTasks(DEFAULT_TASKS);
    return DEFAULT_TASKS;
  }

  saveLocalTasks(tasks) {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Storage quota exceeded or error:", e);
    }
  }

  _enrichCategoryNames(tasks) {
    const categories = categoryService.getLocalCategories();
    const catMap = new Map();
    categories.forEach((c) => catMap.set(Number(c.id_categories), c.name));

    return tasks.map((t) => ({
      ...t,
      category_name: t.category_id
        ? catMap.get(Number(t.category_id)) || t.category_name || t.categories?.name || "Tanpa Kategori"
        : t.category_name || t.categories?.name || "Tanpa Kategori",
    }));
  }

  _getUserId() {
    const user = userService.getUserProfile();
    return user ? user.id_users : null;
  }

  async getTasks() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, categories(name)")
          .eq("user_id", userId)
          .is("deleted_at", null)
          .order("deadline", { ascending: true, nullsFirst: false });

        if (!error && Array.isArray(data)) {
          const pendingQueues = syncService.getQueue().filter((q) => q.type === "CREATE_TASK");
          const localTasks = this.getLocalTasks();
          const pendingLocalTasks = localTasks.filter((lt) =>
            pendingQueues.some((pq) => String(pq.localId) === String(lt.id_tasks))
          );

          const normalized = data.map((t) => ({
            ...t,
            category_name: t.categories?.name || null,
          }));

          const merged = [...pendingLocalTasks, ...normalized];
          this.saveLocalTasks(merged);
          return this._enrichCategoryNames(merged.filter((t) => !t.deleted_at));
        }
      } catch (err) {
        console.warn("Direct Supabase tasks query failed, using local storage fallback:", err.message);
      }
    }

    const all = this.getLocalTasks();
    const active = all.filter((t) => !t.deleted_at);
    return this._enrichCategoryNames(active);
  }

  async getTaskById(id) {
    const tasks = await this.getTasks();
    const found = tasks.find((t) => String(t.id_tasks) === String(id));
    if (found) return found;
    throw new Error("Tugas tidak ditemukan");
  }

  async createTask(data) {
    const title = (data.title || "").trim();
    if (!title) throw new Error("Judul tugas wajib diisi!");

    const userId = this._getUserId();
    const localId = Date.now();
    const payload = {
      user_id: userId,
      title,
      description: (data.description || "").trim() || null,
      category_id: data.category_id ? Number(data.category_id) : null,
      priority: data.priority || "high",
      deadline: data.deadline || null,
      is_completed: false,
      completed_at: null,
      created_at: new Date().toISOString(),
      deleted_at: null,
    };

    const optimisticTask = {
      ...payload,
      id_tasks: localId,
    };

    // Optimistically save to local state immediately
    const current = this.getLocalTasks();
    this.saveLocalTasks([optimisticTask, ...current]);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { data: serverTask, error } = await supabase
          .from("tasks")
          .insert([payload])
          .select()
          .single();

        if (!error && serverTask) {
          const updated = this.getLocalTasks().map((t) =>
            String(t.id_tasks) === String(localId) ? { ...t, ...serverTask } : t
          );
          this.saveLocalTasks(updated);
          return serverTask;
        }
      } catch (err) {
        console.warn("Online Supabase createTask failed, enqueued for background sync:", err.message);
        syncService.enqueue({
          type: "CREATE_TASK",
          payload,
          localId,
        });
        return optimisticTask;
      }
    }

    syncService.enqueue({
      type: "CREATE_TASK",
      payload,
      localId,
    });
    return optimisticTask;
  }

  async updateTask(id, data) {
    const title = (data.title || "").trim();
    if (!title) throw new Error("Judul tugas wajib diisi!");

    const updateFields = {
      title,
      description: (data.description || "").trim() || null,
      category_id: data.category_id ? Number(data.category_id) : null,
      priority: data.priority || "high",
      deadline: data.deadline || null,
    };

    const current = this.getLocalTasks();
    const next = current.map((t) =>
      String(t.id_tasks) === String(id) ? { ...t, ...updateFields } : t
    );
    this.saveLocalTasks(next);
    const updatedLocal = next.find((t) => String(t.id_tasks) === String(id));

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const { data: serverTask, error } = await supabase
          .from("tasks")
          .update(updateFields)
          .eq("id_tasks", id)
          .select()
          .single();

        if (!error && serverTask) {
          const fresh = this.getLocalTasks().map((t) =>
            String(t.id_tasks) === String(id) ? { ...t, ...serverTask } : t
          );
          this.saveLocalTasks(fresh);
          return serverTask;
        }
      } catch (err) {
        console.warn("Online updateTask failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "UPDATE_TASK",
          targetId: id,
          payload: updateFields,
        });
        return updatedLocal;
      }
    }

    syncService.enqueue({
      type: "UPDATE_TASK",
      targetId: id,
      payload: updateFields,
    });
    return updatedLocal;
  }

  async toggleTaskStatus(id) {
    const current = this.getLocalTasks();
    let toggledItem = null;
    const next = current.map((t) => {
      if (String(t.id_tasks) === String(id)) {
        const isComp = !t.is_completed;
        toggledItem = {
          ...t,
          is_completed: isComp,
          completed_at: isComp ? new Date().toISOString() : null,
        };
        return toggledItem;
      }
      return t;
    });
    this.saveLocalTasks(next);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline && toggledItem) {
      try {
        const { data: serverTask, error } = await supabase
          .from("tasks")
          .update({
            is_completed: toggledItem.is_completed,
            completed_at: toggledItem.completed_at,
          })
          .eq("id_tasks", id)
          .select()
          .single();

        if (!error && serverTask) {
          const fresh = this.getLocalTasks().map((t) =>
            String(t.id_tasks) === String(id) ? { ...t, ...serverTask } : t
          );
          this.saveLocalTasks(fresh);
          return serverTask;
        }
      } catch (err) {
        console.warn("Online toggle failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "TOGGLE_TASK",
          targetId: id,
          payload: { is_completed: toggledItem.is_completed },
        });
        return toggledItem;
      }
    }

    if (toggledItem) {
      syncService.enqueue({
        type: "TOGGLE_TASK",
        targetId: id,
        payload: { is_completed: toggledItem.is_completed },
      });
    }
    return toggledItem;
  }

  async softDeleteTask(id) {
    const nowIso = new Date().toISOString();
    const current = this.getLocalTasks();
    const next = current.map((t) =>
      String(t.id_tasks) === String(id) ? { ...t, deleted_at: nowIso } : t
    );
    this.saveLocalTasks(next);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        await supabase
          .from("tasks")
          .update({ deleted_at: nowIso })
          .eq("id_tasks", id);
      } catch (err) {
        console.warn("Online softDeleteTask failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "DELETE_TASK",
          targetId: id,
        });
      }
    } else {
      syncService.enqueue({
        type: "DELETE_TASK",
        targetId: id,
      });
    }

    return { success: true };
  }

  async getDeletedTasks() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*, categories(name)")
          .eq("user_id", userId)
          .not("deleted_at", "is", null)
          .order("deleted_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          const normalized = data.map((t) => ({
            ...t,
            category_name: t.categories?.name || null,
          }));
          return this._enrichCategoryNames(normalized);
        }
      } catch (err) {
        console.warn("Trash query failed, using local storage fallback:", err.message);
      }
    }

    const all = this.getLocalTasks();
    const trashed = all.filter((t) => Boolean(t.deleted_at));
    trashed.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at));
    return this._enrichCategoryNames(trashed);
  }

  async restoreTask(id) {
    const current = this.getLocalTasks();
    const next = current.map((t) =>
      String(t.id_tasks) === String(id) ? { ...t, deleted_at: null } : t
    );
    this.saveLocalTasks(next);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        await supabase
          .from("tasks")
          .update({ deleted_at: null })
          .eq("id_tasks", id);
      } catch (err) {
        console.warn("Online restoreTask failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "RESTORE_TASK",
          targetId: id,
        });
      }
    } else {
      syncService.enqueue({
        type: "RESTORE_TASK",
        targetId: id,
      });
    }

    return { success: true };
  }

  async permanentDeleteTask(id) {
    const current = this.getLocalTasks();
    const next = current.filter((t) => String(t.id_tasks) !== String(id));
    this.saveLocalTasks(next);

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        await supabase.from("tasks").delete().eq("id_tasks", id);
      } catch (err) {
        console.warn("Online permanent delete failed, enqueued for sync:", err.message);
        syncService.enqueue({
          type: "PERMANENT_DELETE_TASK",
          targetId: id,
        });
      }
    } else {
      syncService.enqueue({
        type: "PERMANENT_DELETE_TASK",
        targetId: id,
      });
    }

    return { success: true };
  }

  async restoreAllTasks(taskIds = []) {
    const current = this.getLocalTasks();
    const idSet = new Set(taskIds.map(String));
    const next = current.map((t) =>
      idSet.size === 0 || idSet.has(String(t.id_tasks))
        ? { ...t, deleted_at: null }
        : t
    );
    this.saveLocalTasks(next);

    const toRestore =
      taskIds.length > 0 ? taskIds : current.filter((t) => t.deleted_at).map((t) => t.id_tasks);

    for (const id of toRestore) {
      await this.restoreTask(id);
    }

    return { success: true };
  }

  async emptyTrash() {
    const current = this.getLocalTasks();
    const trashed = current.filter((t) => Boolean(t.deleted_at));
    const next = current.filter((t) => !t.deleted_at);
    this.saveLocalTasks(next);

    for (const t of trashed) {
      await this.permanentDeleteTask(t.id_tasks);
    }

    return { success: true };
  }
}

export default new TaskService();
