// ---------------------------------------------------------------------------
// syncService.js — Background and Online-Offline Data Synchronization
// Powered directly by Supabase BaaS Client.
// When offline: writes to localStorage and queues mutations.
// When online: automatically replays mutations to Supabase & updates cache.
// ---------------------------------------------------------------------------

import { supabase } from "../config/supabase";

const QUEUE_KEY = "doneright_sync_queue";
const LAST_SYNC_KEY = "doneright_last_sync_time";

class SyncService {
  constructor() {
    this._isSyncing = false;
    this._listeners = new Set();

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("[SyncService] Internet connection restored. Triggering sync...");
        this.syncAll();
      });

      // Periodic check every 25 seconds if online and has pending queue
      setInterval(() => {
        if (navigator.onLine && this.getPendingCount() > 0 && !this._isSyncing) {
          this.syncAll();
        }
      }, 25000);
    }
  }

  getQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("[SyncService] Failed to read queue:", e);
    }
    return [];
  }

  _saveQueue(queue) {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      this._notifyListeners();
    } catch (e) {
      console.warn("[SyncService] Failed to save queue:", e);
    }
  }

  getPendingCount() {
    return this.getQueue().length;
  }

  enqueue(action) {
    const queue = this.getQueue();
    const item = {
      id: "sync_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      type: action.type,
      targetId: action.targetId || null,
      localId: action.localId || null,
      payload: action.payload || {},
      timestamp: Date.now(),
    };
    queue.push(item);
    this._saveQueue(queue);

    console.log(`[SyncService] Enqueued offline action: ${item.type}`, item);

    if (typeof navigator !== "undefined" && navigator.onLine) {
      this.syncAll();
    }

    return item;
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notifyListeners(status = null) {
    const state = {
      pendingCount: this.getPendingCount(),
      isSyncing: this._isSyncing,
      lastSync: localStorage.getItem(LAST_SYNC_KEY),
      statusText: status,
    };
    this._listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error("[SyncService] Listener error:", err);
      }
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("doneright:sync-state", { detail: state }));
    }
  }

  async syncAll() {
    if (this._isSyncing) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const queue = this.getQueue();
    if (queue.length === 0) return;

    this._isSyncing = true;
    this._notifyListeners("Menyinkronkan...");

    const idMap = new Map(); // localId -> serverId mapping
    let successCount = 0;
    const remainingQueue = [];

    console.log(`[SyncService] Starting sync for ${queue.length} items to Supabase...`);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        const targetId = idMap.get(String(item.targetId)) || item.targetId;

        switch (item.type) {
          case "CREATE_TASK": {
            const { data, error } = await supabase
              .from("tasks")
              .insert([item.payload])
              .select()
              .single();

            if (error) throw error;
            if (data && data.id_tasks && item.localId) {
              idMap.set(String(item.localId), String(data.id_tasks));
              this._remapLocalTaskId(item.localId, data.id_tasks, data);
            }
            successCount++;
            break;
          }

          case "UPDATE_TASK": {
            const { error } = await supabase
              .from("tasks")
              .update(item.payload)
              .eq("id_tasks", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "TOGGLE_TASK": {
            const isCompleted = Boolean(item.payload?.is_completed);
            const { error } = await supabase
              .from("tasks")
              .update({
                is_completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
              })
              .eq("id_tasks", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "DELETE_TASK": {
            const { error } = await supabase
              .from("tasks")
              .update({ deleted_at: new Date().toISOString() })
              .eq("id_tasks", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "RESTORE_TASK": {
            const { error } = await supabase
              .from("tasks")
              .update({ deleted_at: null })
              .eq("id_tasks", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "PERMANENT_DELETE_TASK": {
            const { error } = await supabase
              .from("tasks")
              .delete()
              .eq("id_tasks", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "CREATE_CATEGORY": {
            const { data, error } = await supabase
              .from("categories")
              .insert([item.payload])
              .select()
              .single();

            if (error) throw error;
            if (data && data.id_categories && item.localId) {
              idMap.set(String(item.localId), String(data.id_categories));
            }
            successCount++;
            break;
          }

          case "UPDATE_CATEGORY": {
            const { error } = await supabase
              .from("categories")
              .update(item.payload)
              .eq("id_categories", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "DELETE_CATEGORY": {
            const { error } = await supabase
              .from("categories")
              .delete()
              .eq("id_categories", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          case "UPDATE_PROFILE": {
            const { error } = await supabase
              .from("users")
              .update(item.payload)
              .eq("id_users", targetId);

            if (error) throw error;
            successCount++;
            break;
          }

          default:
            console.warn("[SyncService] Unknown action type:", item.type);
        }
      } catch (err) {
        console.error(`[SyncService] Failed to replay action ${item.type}:`, err.message);
        remainingQueue.push(item);
        for (let j = i + 1; j < queue.length; j++) {
          remainingQueue.push(queue[j]);
        }
        break;
      }
    }

    this._saveQueue(remainingQueue);
    this._isSyncing = false;

    if (successCount > 0) {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      console.log(`[SyncService] Successfully synced ${successCount} mutations directly to Supabase!`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("doneright:sync-completed", {
            detail: { syncedCount: successCount, remaining: remainingQueue.length },
          })
        );
      }
    }

    this._notifyListeners(
      remainingQueue.length === 0 ? "Tersinkron dengan Database" : "Ada perubahan tertunda"
    );
  }

  _remapLocalTaskId(localId, serverId, serverTask) {
    try {
      const stored = localStorage.getItem("doneright_tasks");
      if (stored) {
        const tasks = JSON.parse(stored);
        const updated = tasks.map((t) => {
          if (String(t.id_tasks) === String(localId)) {
            return {
              ...t,
              ...serverTask,
              id_tasks: serverId,
            };
          }
          return t;
        });
        localStorage.setItem("doneright_tasks", JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("[SyncService] Remap task ID error:", e);
    }
  }
}

export default new SyncService();
