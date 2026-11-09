import React from "react";
import Navbar from "../components/Navbar";
import ConfirmModal from "../components/ConfirmModal";
import AdminCategoryModal from "../components/admindashboard/AdminCategoryModal";
import UserProductivityTable from "../components/admindashboard/UserProductivityTable";
import UserAccountsTable from "../components/admindashboard/UserAccountsTable";
import AdminStatsGrid from "../components/admindashboard/AdminStatsGrid";
import PriorityDistribution from "../components/admindashboard/PriorityDistribution";
import AdminCategoryGrid from "../components/admindashboard/AdminCategoryGrid";
import useAdminDashboardData from "../hooks/useAdminDashboardData";
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

  return (
    <div>
      {/* NAVBAR */}
      <Navbar
        title="DoneRight Admin"
        subtitle="Admin DoneRight"
        user={user}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
      />

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* TABS HEADER */}
        <div className="admin-tabs-card">
          <div className="admin-tabs-row">
            <button
              className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Kelola Kategori
            </button>
            <button
              className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Kelola Akun User
            </button>
          </div>
        </div>

        {/* TAB PANEL: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="tab-panel active">
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
                <div className="board-title">Kelola Kategori Tugas</div>
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
