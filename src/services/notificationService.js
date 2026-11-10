// ---------------------------------------------------------------------------
// notificationService.js — In-App Notifications & Supabase BaaS Synchronization
// Clean deduplication: Strictly 1 notification per task, no duplicates.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";
import userService from "./userService";
import taskService from "./taskService";

const NOTIFS_KEY = "doneright_notifications";

class NotificationService {
  _deduplicate(notifs) {
    if (!Array.isArray(notifs)) return [];
    const seen = new Set();
    const result = [];

    for (const n of notifs) {
      if (!n) continue;

      let key = "";
      if (n.type === "deadline_h1") {
        // Enforce strictly 1 notification per task
        key = n.task_id ? `deadline_task_${n.task_id}` : `deadline_msg_${n.message}`;
      } else if (n.type === "test_notification") {
        // Keep at most 1 test notification
        key = "test_notification_single";
      } else {
        key = `${n.type || "gen"}_${n.id_notifications || n.message}`;
      }

      if (!seen.has(key)) {
        seen.add(key);
        result.push(n);
      }
    }

    return result;
  }

  getLocalNotifs() {
    try {
      const stored = localStorage.getItem(NOTIFS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return this._deduplicate(parsed);
        }
      }
    } catch (e) {
      console.warn("Error reading local notifications:", e);
    }
    return [];
  }

  saveLocalNotifs(notifs) {
    try {
      const deduped = this._deduplicate(notifs);
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(deduped));
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

    // 1. Strictly within 24 hours: diffHours > 0 (not past deadline) and diffHours <= 24
    const isWithin24Hours = diffHours > 0 && diffHours <= 24;

    // 2. Calendar-day H-1: deadline is tomorrow (1 calendar day ahead) and within 36 hours
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const dayDiff = Math.round((deadlineDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
    const isCalendarTomorrow = dayDiff === 1 && diffHours > 0 && diffHours <= 36;

    return isWithin24Hours || isCalendarTomorrow;
  }

  async getNotifications() {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const userId = this._getUserId();

    // 1. Get active tasks to validate against
    let activeTasks = [];
    try {
      const allTasks = await taskService.getTasks();
      if (Array.isArray(allTasks)) {
        activeTasks = allTasks.filter((t) => !t.deleted_at && !t.is_completed);
      }
    } catch {
      activeTasks = [];
    }
    const activeTasksMap = new Map();
    activeTasks.forEach((t) => activeTasksMap.set(String(t.id_tasks), t));

    if (isOnline && userId) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          // Deduplicate rows from Supabase
          const deduplicated = this._deduplicate(data);

          // If there were duplicates in Supabase database, clean them up in background
          if (data.length > deduplicated.length) {
            const keepIds = new Set(deduplicated.map((n) => n.id_notifications));
            const duplicateIds = data
              .filter((n) => !keepIds.has(n.id_notifications) && typeof n.id_notifications === "number")
              .map((n) => n.id_notifications);

            if (duplicateIds.length > 0) {
              supabase
                .from("notifications")
                .delete()
                .in("id_notifications", duplicateIds)
                .then(() => {})
                .catch(() => {});
            }
          }

          // Filter out deadline notifications for tasks that are already completed or deleted
          const filtered = deduplicated.filter((n) => {
            if (n.type === "deadline_h1" && n.task_id) {
              return activeTasksMap.has(String(n.task_id));
            }
            return true;
          });

          // Enrich with task_deadline
          const enriched = filtered.map((n) => {
            if (n.task_id && activeTasksMap.has(String(n.task_id))) {
              const t = activeTasksMap.get(String(n.task_id));
              return { ...n, task_deadline: t.deadline };
            }
            return n;
          });

          this.saveLocalNotifs(enriched);
          return enriched;
        }
      } catch (err) {
        console.warn("Notifications Supabase query error, fallback to local:", err.message);
      }
    }

    // Offline / fallback: Generate strictly for active tasks that meet H-1
    const now = new Date();
    const currentNotifs = this.getLocalNotifs();
    const readIds = new Set(
      currentNotifs.filter((n) => n.is_read).map((n) => String(n.id_notifications))
    );

    const generated = activeTasks
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

    const combined = this._deduplicate([
      ...currentNotifs.filter((n) => n.type === "test_notification"),
      ...generated,
    ]);

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
        const swReadyPromise = navigator.serviceWorker.ready;
        const swTimeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));
        const reg = await Promise.race([swReadyPromise, swTimeoutPromise]);

        if (reg && reg.showNotification) {
          await reg.showNotification(title, notificationOptions);
          return true;
        }

        const activeReg = await navigator.serviceWorker.getRegistration();
        if (activeReg && activeReg.showNotification) {
          await activeReg.showNotification(title, notificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn("[notification] SW showNotification error, falling back:", swErr);
      }
    }

    // 2. Fallback to Window Notification constructor
    try {
      if (typeof Notification !== "undefined") {
        const notif = new Notification(title, notificationOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      }
    } catch (err) {
      console.error("[notification] System notification failed:", err);
      return false;
    }
    return false;
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

  async checkAndNotifyDeadlines(tasksParam = null) {
    let tasks = tasksParam;
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      try {
        tasks = await taskService.getTasks();
      } catch {
        tasks = [];
      }
    }
    if (!Array.isArray(tasks) || tasks.length === 0) return false;

    const userId = this._getUserId();
    const now = new Date();
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // Strictly filter active tasks that are within H-1
    const urgentTasks = tasks.filter((t) => !t.deleted_at && !t.is_completed && this.isTaskH1(t, now));
    if (urgentTasks.length === 0) return false;

    const currentLocalNotifs = this.getLocalNotifs();
    let hasNewInApp = false;

    for (const task of urgentTasks) {
      const taskIdStr = String(task.id_tasks);

      // Check if notification already exists in currentLocalNotifs for this task
      const alreadyInApp = currentLocalNotifs.some(
        (n) => n.type === "deadline_h1" && String(n.task_id) === taskIdStr
      );

      if (!alreadyInApp) {
        hasNewInApp = true;
        const newNotifItem = {
          id_notifications: `notif_${Date.now()}_${taskIdStr}`,
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
            // Check if Supabase already has a record for this task to avoid DB duplicates
            const { data: existingDb } = await supabase
              .from("notifications")
              .select("id_notifications")
              .eq("user_id", userId)
              .eq("task_id", task.id_tasks)
              .eq("type", "deadline_h1");

            if (existingDb && existingDb.length > 0) {
              newNotifItem.id_notifications = existingDb[0].id_notifications;
            } else {
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
            }
          } catch (insertErr) {
            console.warn("Supabase notification insert warning:", insertErr.message);
          }
        }

        currentLocalNotifs.unshift(newNotifItem);
      }
    }

    if (hasNewInApp) {
      this.saveLocalNotifs(currentLocalNotifs);
      return true;
    }

    return false;
  }
}

export default new NotificationService();
