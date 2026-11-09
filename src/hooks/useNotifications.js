import { useState, useEffect } from "react";
import notificationService from "../services/notificationService";

export default function useNotifications(token, showNotifBell) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    if (!showNotifBell) return;
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token, showNotifBell]);

  const handleReadNotif = async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      setNotifications(updated);
    } catch (err) {
      console.error("Read notification error:", err);
    }
  };

  const handleReadAllNotifs = async () => {
    try {
      const updated = await notificationService.markAllAsRead();
      setNotifications(updated);
    } catch (err) {
      console.error("Read all notifications error:", err);
    }
  };

  const handleDeleteNotif = async (id) => {
    try {
      const updated = await notificationService.deleteNotification(id);
      setNotifications(updated);
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    setNotifications,
    unreadCount,
    fetchNotifications,
    handleReadNotif,
    handleReadAllNotifs,
    handleDeleteNotif,
  };
}
