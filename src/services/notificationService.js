// ---------------------------------------------------------------------------
// notificationService.js — Local and Supabase BaaS notification management.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import userService from "./userService";
import taskService from "./taskService";

const NOTIFS_KEY = "doneright_notifications";

class NotificationService {
  getLocalNotifs() {
    try {
      const stored = localStorage.getItem(NOTIFS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Error reading local notifications:", e);
    }
    return [];
  }

  saveLocalNotifs(notifs) {
    try {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
    } catch (e) {
      console.warn("Storage error for notifications:", e);
    }
  }

  _getUserId() {
    const user = userService.getUserProfile();
    return user.id_users || 32;
  }

  async getNotifications() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          this.saveLocalNotifs(data);
          return data;
        }
      } catch (err) {
        console.warn("Notifications Supabase query error, generating from tasks:", err.message);
      }
    }

    // Generate smart local notifications from active tasks with deadlines
    const tasks = await taskService.getTasks();
    const now = new Date();
    const currentNotifs = this.getLocalNotifs();
    const readIds = new Set(currentNotifs.filter((n) => n.is_read).map((n) => n.id_notifications));

    const generated = tasks
      .filter((t) => !t.is_completed && t.deadline)
      .map((t) => {
        const deadline = new Date(t.deadline);
        const diffHours = (deadline - now) / 3600000;
        let message = `Tugas "${t.title}" memiliki batas waktu pengumpulan.`;
        if (diffHours < 0) {
          message = `Perhatian: Tugas "${t.title}" telah melewati batas deadline!`;
        } else if (diffHours < 24) {
          message = `Pengingat: Tugas "${t.title}" harus dikumpulkan dalam waktu kurang dari 24 jam!`;
        }

        const id_notifications = `notif_${t.id_tasks}`;
        return {
          id_notifications,
          task_id: t.id_tasks,
          task_deadline: t.deadline,
          message,
          is_read: readIds.has(id_notifications),
          created_at: t.created_at || now.toISOString(),
        };
      });

    this.saveLocalNotifs(generated);
    return generated;
  }

  async markAsRead(id) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    if (isOnline && typeof id === "number") {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id_notifications", id);
      } catch (e) {
        // fallback
      }
    }
    const current = this.getLocalNotifs();
    const next = current.map((n) =>
      String(n.id_notifications) === String(id) ? { ...n, is_read: true } : n
    );
    this.saveLocalNotifs(next);
    return next;
  }

  async markAllAsRead() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    if (isOnline) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId);
      } catch (e) {
        // fallback
      }
    }
    const current = this.getLocalNotifs();
    const next = current.map((n) => ({ ...n, is_read: true }));
    this.saveLocalNotifs(next);
    return next;
  }

  async deleteNotification(id) {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline && typeof id === "number") {
      try {
        await supabase
          .from("notifications")
          .delete()
          .eq("id_notifications", id);
      } catch (e) {
        // fallback
      }
    }
    const current = this.getLocalNotifs();
    const next = current.filter((n) => String(n.id_notifications) !== String(id));
    this.saveLocalNotifs(next);
    return next;
  }
}

export default new NotificationService();
