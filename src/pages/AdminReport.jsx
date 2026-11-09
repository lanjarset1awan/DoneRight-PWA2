import React from "react";
import Navbar from "../components/Navbar";
import useAdminReportData from "../hooks/useAdminReportData";
import ReportBanner from "../components/report/ReportBanner";
import ReportStatsGrid from "../components/report/ReportStatsGrid";
import ReportActions from "../components/report/ReportActions";
import "../styles/pages/report-detail.css";

export default function AdminReport({ token, user, onLogout, onNavigateDashboard, onOpenProfile }) {
  const {
    stats,
    loading,
    downloading,
    toast,
    handleDownloadPDF,
    total,
    completed,
    overdueCount,
    completionRate
  } = useAdminReportData(token);

  const statsCards = stats ? [
    {
      label: "Total Pengguna",
      value: stats.total_users || 0,
      subLabel: "User terdaftar",
      iconClass: "icon-blue",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      label: "Total Semua Tugas",
      value: total,
      subLabel: "Seluruh tugas pengguna",
      iconClass: "icon-blue",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      label: "Tugas Selesai",
      value: completed,
      subLabel: "Berhasil diselesaikan",
      iconClass: "icon-green",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      label: "Tugas Overdue",
      value: overdueCount,
      subLabel: "Tugas yang terlambat",
      iconClass: "icon-red",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
  ] : [];

  return (
    <div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* NAVBAR */}
      <Navbar
        title="DoneRight"
        subtitle={`Panel Administrator • ${user ? (user.nama || user.username) : "Admin"}`}
        user={user}
        token={token}
        showNotifBell={true}
        onNavigateDashboard={onNavigateDashboard}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
      />

      {/* MAIN CONTAINER */}
      <div className="dashboard-container admin-report-container">
        {/* BACK BUTTON */}
        <div className="report-header-row admin-report-header">
          <button 
            className="btn-secondary admin-report-btn-back" 
            onClick={onNavigateDashboard}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Dashboard Admin
          </button>
        </div>

        {loading ? (
          <div className="report-loading admin-report-loading-container">
            <div className="admin-report-loading-icon-wrapper">
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="admin-report-loading-text">Menganalisis performa sistem secara global...</p>
          </div>
        ) : !stats ? (
          <div className="report-loading admin-report-error-container">
            <div className="admin-report-error-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="admin-report-error-text">Terjadi kesalahan saat memuat data laporan global.</p>
          </div>
        ) : (
          <div className="report-content active">
            {/* BIG BANNER */}
            <ReportBanner
              label="Global Productivity Rate Sistem"
              value={completionRate}
              percent={completionRate}
              cardClass="admin-report-banner-card"
              labelClass="admin-report-banner-label"
              valueClass="admin-report-banner-value"
              containerClass="admin-report-progress-container"
              fillClass="admin-report-progress-fill"
            />

            {/* STATS GRID */}
            <ReportStatsGrid
              cards={statsCards}
              gridClass="admin-report-stats-grid"
            />

            {/* ACTION CARD */}
            <ReportActions
              title="Unduh Laporan Global Format PDF"
              description="Dapatkan dokumen laporan PDF global resmi yang memuat rangkuman statistik pengguna, tugas, dan tingkat penyelesaian tepat waktu di seluruh sistem."
              onDownload={handleDownloadPDF}
              downloading={downloading}
              downloadingText="Mengunduh PDF Global..."
              buttonText="Unduh Laporan PDF Global"
              cardClass="admin-report-action-card"
              titleClass="admin-report-action-title"
              descClass="admin-report-action-desc"
              btnClass="admin-report-btn-download"
            />
          </div>
        )}
      </div>
      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
