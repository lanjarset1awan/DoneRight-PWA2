import React from "react";
import { LayoutDashboard, FolderTree, Users, BarChart2 } from "lucide-react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import AdminCategoryModal from "../components/admindashboard/AdminCategoryModal";
import UserProductivityTable from "../components/admindashboard/UserProductivityTable";
import UserAccountsTable from "../components/admindashboard/UserAccountsTable";
import AdminStatsGrid from "../components/admindashboard/AdminStatsGrid";
import PriorityDistribution from "../components/admindashboard/PriorityDistribution";
import AdminCategoryGrid from "../components/admindashboard/AdminCategoryGrid";
import useAdminDashboardData from "../hooks/useAdminDashboardData";
import "../styles/components/nav-tabs.css";
import "../styles/pages/dashboard-admin.css";

export default function AdminDashboard({ token, user, onLogout, onNavigateReport, onOpenProfile }) {
  const {
    activeTab,
    setActiveTab,
    categories,
    loading,
    usersStats,
    loadingUsersStats,
    downloadingPdf,
    usersList,
    loadingUsersList,
    showCategoryModal,
    setShowCategoryModal,
    closingModals,
    editingCategory,
    setEditingCategory,
    categorySubmitting,
    setCategorySubmitting,
    confirmModal,
    toast,
    closeModal,
    handleDownloadUserPDF,
    handleSoftDeleteUser,
    handleRestoreUser,
    handleCategorySubmit,
    handleDeleteCategory,
    totalTasksCount,
    completedTasksCount,
    overdueCount,
    activeCount,
    completionRate,
    highCount,
    mediumCount,
    lowCount,
    highPercent,
    mediumPercent,
    lowPercent
  } = useAdminDashboardData(token);

  const adminTabs = [
    {
      id: "overview",
      label: "Overview",
      shortLabel: "Overview",
      icon: <LayoutDashboard size={16} />
    },
    {
      id: "categories",
      label: "Kelola Kategori",
      shortLabel: "Kategori",
      icon: <FolderTree size={16} />
    },
    {
      id: "users",
      label: "Kelola Akun User",
      shortLabel: "Akun User",
      icon: <Users size={16} />
    }
  ];

  return (
    <div>
      {/* NAVBAR */}
      <Navbar
        title="DoneRight"
        subtitle={`Panel Administrator • ${user ? (user.nama || user.username) : "Admin"}`}
        user={user}
        token={token}
        showNotifBell={true}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onNavigateDashboard={() => {
          setActiveTab("overview");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* NAVIGATION SLIDER TABS */}
        <div className="nav-tabs-card">
          <div className="nav-tabs-slider">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`nav-tab-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-tab-icon">{tab.icon}</span>
                <span className="nav-tab-label-full">{tab.label}</span>
                <span className="nav-tab-label-short">{tab.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* TAB PANEL: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-panel active">
            {/* OVERVIEW HEADER CARD */}
            <div className="board-card admin-overview-card">
              <div className="admin-overview-card-body">
                <div className="admin-overview-text-group">
                  <div className="board-title">Overview Statistik Sistem</div>
                  <p className="board-subtitle">
                    Tabel produktivitas pengguna dan distribusi tugas secara global
                  </p>
                </div>
                {onNavigateReport && (
                  <button
                    type="button"
                    className="btn-primary admin-dash-btn-report-action"
                    onClick={onNavigateReport}
                    title="Lihat Laporan Produktivitas Global"
                  >
                    <BarChart2 size={16} />
                    <span>Laporan Global</span>
                  </button>
                )}
              </div>
            </div>

            {/* STATS GRID */}
            <AdminStatsGrid
              totalTasksCount={totalTasksCount}
              completedTasksCount={completedTasksCount}
              completionRate={completionRate}
              activeCount={activeCount}
              overdueCount={overdueCount}
            />

            {/* PRIORITY DISTRIBUTION */}
            <PriorityDistribution
              highCount={highCount}
              highPercent={highPercent}
              mediumCount={mediumCount}
              mediumPercent={mediumPercent}
              lowCount={lowCount}
              lowPercent={lowPercent}
            />

            {/* USER PRODUCTIVITY TABLE */}
            <UserProductivityTable
              usersStats={usersStats}
              loadingUsersStats={loadingUsersStats}
              downloadingPdf={downloadingPdf}
              onDownloadPDF={handleDownloadUserPDF}
            />
          </div>
        )}

        {/* TAB PANEL: KELOLA KATEGORI */}
        {activeTab === "categories" && (
          <div className="tab-panel active">
            <div className="board-card">
              <div className="board-header">
                <div>
                  <div className="board-title">Kelola Kategori Tugas</div>
                  <p className="board-subtitle">
                    Daftar kategori global yang digunakan untuk mengelompokkan tugas di sistem
                  </p>
                </div>
                <button
                  className="btn-primary admin-dash-btn-manage-cats"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategorySubmitting(false);
                    setShowCategoryModal(true);
                  }}
                >
                  <span className="btn-icon-add">+</span> Tambah Kategori
                </button>
              </div>

              <AdminCategoryGrid
                loading={loading}
                categories={categories}
                setEditingCategory={setEditingCategory}
                setCategorySubmitting={setCategorySubmitting}
                setShowCategoryModal={setShowCategoryModal}
                handleDeleteCategory={handleDeleteCategory}
              />
            </div>
          </div>
        )}

        {/* TAB PANEL: KELOLA AKUN USER */}
        {activeTab === "users" && (
          <div className="tab-panel active">
            <UserAccountsTable
              usersList={usersList}
              loadingUsersList={loadingUsersList}
              currentUser={user}
              onSoftDeleteUser={handleSoftDeleteUser}
              onRestoreUser={handleRestoreUser}
            />
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT GLOBAL CATEGORY */}
      <AdminCategoryModal
        show={showCategoryModal}
        closingModal={closingModals.category ? "category" : ""}
        closeModal={closeModal}
        editingCategory={editingCategory}
        categorySubmitting={categorySubmitting}
        onSubmit={handleCategorySubmit}
      />

      {/* CUSTOM CONFIRMATION MODAL */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        closingModal={closingModals.confirm ? "confirm" : ""}
        closeModal={closeModal}
        overlayClass="admin-dash-modal-overlay"
        titleClass={confirmModal.isDanger ? "admin-dash-modal-title-danger" : "admin-dash-modal-title-default"}
        closeBtnClass="admin-dash-modal-close"
        bodyTextClass="admin-dash-modal-body-text"
        footerClass="admin-dash-modal-footer"
        cancelBtnClass="admin-dash-modal-btn-cancel"
        confirmBtnClass="admin-dash-modal-btn-confirm"
      />

      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
