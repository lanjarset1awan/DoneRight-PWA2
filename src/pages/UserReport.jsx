import React from "react";
import Navbar from "../components/Navbar";
import NavigationTabs from "../components/NavigationTabs";
import useUserReportData from "../hooks/useUserReportData";
import ReportBanner from "../components/report/ReportBanner";
import ReportStatsGrid from "../components/report/ReportStatsGrid";
import ReportActions from "../components/report/ReportActions";
import "../styles/pages/report-detail.css";

export default function UserReport({ token, user, onLogout, onNavigateDashboard, onNavigateTrash, onOpenProfile }) {
  const {
    stats,
    loading,
    downloading,
    toast,
    handleDownloadPDF,
    productivity
  } = useUserReportData(token);

  const statsCards = stats ? [
    {
      label: "Total Tugas",
      value: stats.total_tasks || 0,
      subLabel: "Tugas Anda terdaftar",
      iconClass: "icon-blue",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      label: "Tugas Selesai",
      value: stats.completed_tasks || 0,
      subLabel: "Berhasil diselesaikan",
      iconClass: "icon-green",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      label: "Tepat Waktu",
      value: stats.on_time || 0,
      subLabel: "Sebelum deadline",
      iconClass: "icon-yellow",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: "Terlambat",
      value: stats.overdue || 0,
      subLabel: "Melewati deadline",
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
        subtitle="Analisis Performa Produktivitas"
        user={user}
        token={token}
        showNotifBell={true}
        onNavigateDashboard={onNavigateDashboard}
        onNavigateTrash={onNavigateTrash}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
      />

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* NAVIGATION SLIDER TABS */}
        <NavigationTabs
          activeTab="report"
          onNavigate={(target) => {
            if (target === "dashboard") onNavigateDashboard();
            else if (target === "trash") onNavigateTrash && onNavigateTrash();
          }}
        />

        <div className="user-report-inner">
          <div className="user-report-header">
            <button
              className="btn-secondary user-report-btn-back"
              onClick={onNavigateDashboard}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar Tugas
            </button>
          </div>

          {loading ? (
          <div className="report-loading user-report-loading-container">
            <div className="user-report-loading-icon-wrapper">
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="user-report-loading-text">Menganalisis performa tugas Anda...</p>
          </div>
        ) : !stats ? (
          <div className="report-loading user-report-error-container">
            <div className="user-report-error-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="user-report-error-text">Terjadi kesalahan saat memuat data laporan.</p>
          </div>
        ) : (
          <div className="report-content active">
            {/* BIG BANNER */}
            <ReportBanner
              label="Productivity Rate Anda"
              value={productivity}
              percent={productivity}
              cardClass="user-report-banner-card"
              labelClass="user-report-banner-label"
              valueClass="user-report-banner-value"
              containerClass="user-report-progress-container"
              fillClass="user-report-progress-fill"
            />

            {/* STATS GRID */}
            <ReportStatsGrid
              cards={statsCards}
              gridClass="user-report-stats-grid"
            />

            {/* ACTION CARD */}
            <ReportActions
              title="Unduh Laporan Format PDF"
              description="Dapatkan dokumen PDF resmi yang memuat rincian statistik tugas, kategori, dan timeline performa produktivitas Anda."
              onDownload={handleDownloadPDF}
              downloading={downloading}
              downloadingText="Mengunduh PDF..."
              buttonText="Unduh Laporan PDF"
              cardClass="user-report-action-card"
              titleClass="user-report-action-title"
              descClass="user-report-action-desc"
              btnClass="user-report-btn-download"
            />
          </div>
        )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
