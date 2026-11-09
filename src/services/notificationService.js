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
    return user ? user.id_users : null;
  }

  isTaskH1(task, now = new Date()) {
    if (!task || task.is_completed || !task.deadline || task.deleted_at) {
      return false;
    }
    const deadlineStr = typeof task.deadline === "string" ? task.deadline.replace(" ", "T") : task.deadline;
    const deadline = new Date(deadlineStr);
    if (isNaN(deadline.getTime())) return false;

    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Strictly within 24 hours: diffHours > 0 (not past deadline) and diffHours <= 24 (within 24 hours / H-1)
    return diffHours > 0 && diffHours <= 24;
  }

  async getNotifications() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    if (isOnline && userId) {
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

    // Generate local notifications STRICTLY for active tasks with deadline H-1 (<= 24 jam)
    const tasks = await taskService.getTasks();
    const now = new Date();
    const currentNotifs = this.getLocalNotifs();
    const readIds = new Set(
      currentNotifs.filter((n) => n.is_read).map((n) => String(n.id_notifications))
    );

    // Only include tasks that are strictly within H-1 (<= 24 hours)
    const generated = tasks
      .filter((t) => this.isTaskH1(t, now))
      .map((t) => {
        const id_notifications = `notif_h1_${t.id_tasks}`;
        return {
          id_notifications,
          task_id: t.id_tasks,
          task_deadline: t.deadline,
          type: "deadline_h1",
          message: `Tugas "${t.title}" mendekati batas waktu (H-1).`,
          is_read: readIds.has(id_notifications),
          created_at: now.toISOString(),
        };
      });

    // Merge existing local test notifications if any
    const existingTests = currentNotifs.filter((n) => n.type === "test_notification");
    const combined = [...existingTests, ...generated];

    this.saveLocalNotifs(combined);
    return combined;
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
        await this.sendSystemNotification("Notifikasi DoneRight Aktif!", {
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

  _getAbsoluteUrl(path) {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
      return path;
    }
    if (typeof window !== "undefined" && window.location && window.location.origin) {
      try {
        return new URL(path, window.location.origin).href;
      } catch {
        return path;
      }
    }
    return path;
  }

  async sendSystemNotification(title, options = {}) {
    if (!this.isSystemNotificationSupported()) return false;
    if (this.getSystemPermission() !== "granted") return false;

    const bellIcon = this._getAbsoluteUrl(options.icon || "/notification-bell.png");
    const bellBadge = this._getAbsoluteUrl(options.badge || "/notification-badge.png");

    const notificationOptions = {
      body: options.body || "Pengingat tugas dari DoneRight",
      icon: bellIcon,
      badge: bellBadge,
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
      const notif = new Notification(title, notificationOptions);
      notif.onclick = () => {
        window.focus();
        notif.close();
      };
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

    const title = "Pengingat Tugas DoneRight";
    const body = "Ini adalah notifikasi sistem HP nyata! Klik untuk kembali ke aplikasi.";
    const sent = await this.sendSystemNotification(title, {
      body,
      tag: "doneright-test-" + Date.now(),
      data: { url: "/" },
    });

    // Also record into in-app bell dropdown
    const userId = this._getUserId();
    const testNotif = {
      id_notifications: `test_${Date.now()}`,
      user_id: userId,
      type: "test_notification",
      message: "Tes notifikasi berhasil! Sistem notifikasi HP dan aplikasi DoneRight terhubung.",
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const current = this.getLocalNotifs();
    current.unshift(testNotif);
    this.saveLocalNotifs(current);

    if (userId && (typeof navigator === "undefined" || navigator.onLine)) {
      try {
        await supabase.from("notifications").insert([
          {
            user_id: userId,
            type: "test_notification",
            message: "Tes notifikasi berhasil! Sistem notifikasi HP dan aplikasi DoneRight terhubung.",
            is_read: false,
          },
        ]);
      } catch (e) {
        // ignore
      }
    }

    return sent;
  }

  async checkAndNotifyDeadlines(tasks = []) {
    if (!Array.isArray(tasks) || tasks.length === 0) return false;

    const userId = this._getUserId();
    const now = new Date();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const isSystemGranted = this.getSystemPermission() === "granted";

    // Strictly filter tasks that are within H-1 (<= 24 hours, not yet expired)
    const urgentTasks = tasks.filter((t) => this.isTaskH1(t, now));
    if (urgentTasks.length === 0) return false;

    const notifiedKey = `doneright_notified_h1_${userId || "guest"}`;
    let notifiedIds = [];
    try {
      const stored = localStorage.getItem(notifiedKey);
      if (stored) notifiedIds = JSON.parse(stored);
    } catch {
      notifiedIds = [];
    }

    let hasNewNotifications = false;
    const currentLocalNotifs = this.getLocalNotifs();

    for (const task of urgentTasks) {
      const tagId = `deadline_h1_${task.id_tasks}`;

      // Check if already notified
      const alreadyNotified =
        notifiedIds.includes(tagId) ||
        currentLocalNotifs.some(
          (n) => (n.task_id === task.id_tasks || n.id_notifications === tagId) && n.type === "deadline_h1"
        );

      if (!alreadyNotified) {
        hasNewNotifications = true;
        notifiedIds.push(tagId);

        const notifTitle = `Deadline H-1: ${task.title}`;
        const notifBody = `Tugas "${task.title}" tersisa kurang dari 24 jam! Segera kumpulkan sebelum batas waktu.`;

        // 1. Send native mobile notification
        if (isSystemGranted) {
          await this.sendSystemNotification(notifTitle, {
            body: notifBody,
            tag: tagId,
            data: { url: "/" },
          });
        }

        // 2. Also record into in-app bell notifications and Supabase
        const newNotifItem = {
          id_notifications: `notif_${Date.now()}_${task.id_tasks}`,
          user_id: userId,
          task_id: task.id_tasks,
          task_deadline: task.deadline,
          type: "deadline_h1",
          message: `Tugas "${task.title}" mendekati batas waktu (H-1).`,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        if (isOnline && userId) {
          try {
            const { data: inserted, error } = await supabase
              .from("notifications")
              .insert([
                {
                  user_id: userId,
                  task_id: task.id_tasks,
                  type: "deadline_h1",
                  message: `Tugas "${task.title}" mendekati batas waktu (H-1).`,
                  is_read: false,
                },
              ])
              .select()
              .single();

            if (!error && inserted) {
              newNotifItem.id_notifications = inserted.id_notifications;
            }
          } catch (insertErr) {
            console.warn("Supabase insert notification warning:", insertErr.message);
          }
        }

        currentLocalNotifs.unshift(newNotifItem);
      }
    }

    if (hasNewNotifications) {
      this.saveLocalNotifs(currentLocalNotifs);
      try {
        localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds.slice(-50)));
      } catch (e) {
        // ignore
      }
      return true;
    }

    return false;
  }
}

export default new NotificationService();
