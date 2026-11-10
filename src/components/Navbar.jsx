import { useState, useEffect, useRef } from "react";
import useNotifications from "../hooks/useNotifications";
import notificationService from "../services/notificationService";

export default function Navbar({
  token,
  title = "DoneRight",
  subtitle,
  user,
  onOpenProfile,
  onLogout,
  onNavigateDashboard,
  // Notification props
  showNotifBell = false,
  tasks = [],
  setSelectedTask,
  setShowDetailModal,
}) {
  const {
    notifications,
    unreadCount,
    handleReadNotif,
    handleReadAllNotifs,
    handleDeleteNotif,
    fetchNotifications,
  } = useNotifications(token, showNotifBell);

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isNotifClosing, setIsNotifClosing] = useState(false);
  const notifDropdownRef = useRef(null);

  // Automatically check urgent deadline tasks (H-1) and sync to in-app bell
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      notificationService.checkAndNotifyDeadlines(tasks).then((hasNew) => {
        if (hasNew && fetchNotifications) {
          fetchNotifications();
        }
      });
    }
  }, [tasks]);

  const showNotifDropdownRef = useRef(showNotifDropdown);
  showNotifDropdownRef.current = showNotifDropdown;

  const closeNotifDropdown = () => {
    setIsNotifClosing(true);
    setTimeout(() => {
      setShowNotifDropdown(false);
      setIsNotifClosing(false);
    }, 190);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        if (showNotifDropdownRef.current) closeNotifDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const formattedStr = typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;
    const date = new Date(formattedStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  return (
    <nav className="dashboard-navbar">
      <a
        href="/"
        className="navbar-brand"
        onClick={(e) => {
          // If Ctrl, Cmd, Shift, Alt is pressed, or if not standard primary left-click, let browser open in new tab/window natively (like YouTube logo)
          if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
            return;
          }
          e.preventDefault();
          if (onNavigateDashboard) {
            onNavigateDashboard();
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onKeyDown={(e) => {
          if (e.key === " " && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            if (onNavigateDashboard) onNavigateDashboard();
            else window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        title="Kembali ke Beranda"
      >
        <img
          src="/favicon.svg"
          alt="DoneRight"
          className="brand-logo-img"
          style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "8px", flexShrink: 0 }}
        />
        <div>
          <div className="navbar-title">{title}</div>
          {subtitle && <div className="navbar-subtitle">{subtitle}</div>}
        </div>
      </a>

      <div className="btn-group-row admin-dash-header-row" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* NOTIFICATION BELL */}
        {showNotifBell && (
          <div className="notif-bell-container" ref={notifDropdownRef}>
            <button
              className={`btn-notif-bell ${showNotifDropdown ? "active" : ""}`}
              onClick={() => {
                if (showNotifDropdown) {
                  closeNotifDropdown();
                } else {
                  setShowNotifDropdown(true);
                }
              }}
              title="Notifikasi"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifDropdown && (
              <div className={`notif-dropdown ${isNotifClosing ? "closing" : ""}`}>
                <div className="notif-dropdown-header">
                  <h3>Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button type="button" className="btn-read-all" onClick={handleReadAllNotifs}>
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="notif-dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="notif-empty-icon-svg">
                        <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
                        <path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4-.4" />
                        <path d="m2 2 20 20" />
                      </svg>
                      <p>Belum ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id_notifications}
                        className={`notif-item ${!notif.is_read ? "unread" : ""}`}
                        onClick={() => {
                          if (notif.task_id && setShowDetailModal && setSelectedTask) {
                            const foundTask = tasks.find((t) => t.id_tasks === notif.task_id);
                            if (foundTask) {
                              setSelectedTask(foundTask);
                              setShowDetailModal(true);
                              closeNotifDropdown();
                            }
                          }
                          if (!notif.is_read) {
                            handleReadNotif(notif.id_notifications);
                          }
                        }}
                      >
                        <div
                          className="notif-item-bell-icon"
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "10px",
                            backgroundColor: !notif.is_read ? "#ede9fe" : "#f8fafc",
                            color: !notif.is_read ? "#4f46e5" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: !notif.is_read ? "0 0 10px rgba(79, 70, 229, 0.28)" : "none",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={!notif.is_read ? 2.3 : 2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                          </svg>
                        </div>
                        <div className="notif-item-content">
                          <p className="notif-item-message">{notif.message}</p>
                          <div className="notif-item-meta">
                            {notif.task_deadline && (
                              <span className="notif-item-deadline">
                                Batas: {new Date(typeof notif.task_deadline === "string" ? notif.task_deadline.replace(" ", "T") : notif.task_deadline).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                            <span className="notif-item-time">
                              {formatTimeAgo(notif.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="notif-item-actions">
                          {!notif.is_read && (
                            <button
                              type="button"
                              className="btn-mark-read-icon"
                              title="Tandai dibaca"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReadNotif(notif.id_notifications);
                              }}
                            >
                              ✓
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-delete-notif-icon"
                            title="Hapus Notifikasi"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotif(notif.id_notifications);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ width: "14px", height: "14px" }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profil Button */}
        {onOpenProfile && (
          <button
            className="btn-secondary nav-btn-profile"
            onClick={onOpenProfile}
            type="button"
          >
            {user && user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <span className="nav-btn-text nav-btn-text-profile">Profil</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          className="btn-logout"
          onClick={onLogout}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="nav-btn-text">Logout</span>
        </button>
      </div>
    </nav>
  );
}
