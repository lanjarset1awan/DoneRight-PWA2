// ---------------------------------------------------------------------------
// notificationService.js — Local, Supabase BaaS, and Mobile System Notifications.
// Supports native Web Notifications & Service Worker Push Notifications.
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
      .filter((t) => !t.is_completed && t.deadline && !t.deleted_at)
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

  // -------------------------------------------------------------------------
  // Native Mobile & Browser System Notifications (Web Notification API)
  // Pops up directly in the user's phone / desktop notification shade.
  // -------------------------------------------------------------------------

  isSystemNotificationSupported() {
    return typeof window !== "undefined" && ("Notification" in window || "serviceWorker" in navigator);
  }

  getSystemPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  async requestSystemPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await this.sendSystemNotification("🔔 Notifikasi DoneRight Aktif!", {
          body: "Pengingat deadline tugas Anda sekarang akan muncul langsung di bilah notifikasi HP.",
          tag: "doneright-activated",
        });
      }
      return permission;
    } catch (err) {
      console.warn("Permission request error:", err);
      return "denied";
    }
  }

  async sendSystemNotification(title, options = {}) {
    if (!this.isSystemNotificationSupported()) return false;
    if (this.getSystemPermission() !== "granted") return false;

    const notificationOptions = {
      body: options.body || "Pengingat tugas dari DoneRight",
      icon: options.icon || "/icon-192.png",
      badge: options.badge || "/favicon.svg",
      tag: options.tag || "doneright-task-" + Date.now(),
      renotify: true,
      vibrate: [200, 100, 200],
      data: options.data || { url: "/" },
    };

    // 1. Try Service Worker registration showNotification (standard for PWA on mobile)
    if ("serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn("[notification] SW showNotification error, falling back:", swErr);
      }
    }

    // 2. Fallback to Window Notification constructor
    try {
      new Notification(title, notificationOptions);
      return true;
    } catch (err) {
      console.error("[notification] System notification failed:", err);
      return false;
    }
  }

  async testSystemNotification() {
    const perm = this.getSystemPermission();
    if (perm !== "granted") {
      const newPerm = await this.requestSystemPermission();
      if (newPerm !== "granted") return false;
    }

    return this.sendSystemNotification("🔔 Pengingat Tugas DoneRight", {
      body: "Ini adalah notifikasi sistem HP nyata! Tugas Anda akan terpantau dan muncul di notifikasi HP.",
      tag: "doneright-test-" + Date.now(),
    });
  }

  async checkAndNotifyDeadlines(tasks = []) {
    if (this.getSystemPermission() !== "granted") return;
    if (!Array.isArray(tasks) || tasks.length === 0) return;

    const now = new Date();
    const notifiedKey = "doneright_notified_deadlines";
    let notifiedIds = [];
    try {
      const stored = localStorage.getItem(notifiedKey);
      if (stored) notifiedIds = JSON.parse(stored);
    } catch {
      notifiedIds = [];
    }

    const urgentTasks = tasks.filter((t) => {
      if (t.is_completed || !t.deadline || t.deleted_at) return false;
      const deadline = new Date(t.deadline);
      const diffHours = (deadline - now) / 3600000;
      return diffHours > 0 && diffHours <= 24;
    });

    for (const task of urgentTasks) {
      const tagId = `task_${task.id_tasks}_${task.deadline}`;
      if (!notifiedIds.includes(tagId)) {
        await this.sendSystemNotification(`⏰ Deadline Mendekat: ${task.title}`, {
          body: `Tugas "${task.title}" harus dikumpulkan dalam waktu kurang dari 24 jam!`,
          tag: tagId,
        });
        notifiedIds.push(tagId);
      }
    }

    try {
      localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds.slice(-50)));
    } catch (e) {
      // ignore
    }
  }
}

export default new NotificationService();
