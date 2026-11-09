import React from "react";

export default function AdminStatsGrid({
  totalTasksCount,
  completedTasksCount,
  completionRate,
  activeCount,
  overdueCount,
}) {
  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <div className="admin-stat-left">
          <span className="admin-stat-label">Total Tugas</span>
          <span className="admin-stat-value">{totalTasksCount}</span>
          <span className="admin-stat-sub">Tugas terdaftar</span>
        </div>
        <div className="admin-stat-icon-circle icon-blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-left">
          <span className="admin-stat-label">Selesai</span>
          <span className="admin-stat-value">{completedTasksCount}</span>
          <span className="admin-stat-sub">{completionRate}% completion rate</span>
        </div>
        <div className="admin-stat-icon-circle icon-green">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-left">
          <span className="admin-stat-label">Aktif</span>
          <span className="admin-stat-value">{activeCount}</span>
          <span className="admin-stat-sub">Sedang berjalan</span>
        </div>
        <div className="admin-stat-icon-circle icon-yellow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-left">
          <span className="admin-stat-label">Overdue</span>
          <span className="admin-stat-value">{overdueCount}</span>
          <span className="admin-stat-sub">Perlu perhatian</span>
        </div>
        <div className="admin-stat-icon-circle icon-red">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
