import React from "react";
import Navbar from "../components/Navbar";
import NavigationTabs from "../components/NavigationTabs";
import ConfirmModal from "../components/ConfirmModal";
import TrashActions from "../components/trash/TrashActions";
import TrashList from "../components/trash/TrashList";
import useTrashData from "../hooks/useTrashData";
import "../styles/pages/trash.css";

export default function Trash({ token, user, onLogout, onNavigateDashboard, onNavigateReport, onOpenProfile }) {
  const {
    trashTasks,
    loading,
    processing,
    confirmModal,
    closingModals,
    toast,
    handleRestore,
    handleDeletePermanent,
    handleRestoreAll,
    handleClearAll,
    closeModal
  } = useTrashData(token);

  return (
    <div>
      {/* NAVBAR */}
      <Navbar
        title="DoneRight"
        subtitle="Keranjang Sampah & Restorasi"
        user={user}
        token={token}
        showNotifBell={true}
        onNavigateDashboard={onNavigateDashboard}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
      />

      {/* MAIN CONTAINER */}
      <div className="dashboard-container">
        {/* NAVIGATION SLIDER TABS */}
        <NavigationTabs
          activeTab="trash"
          onNavigate={(target) => {
            if (target === "dashboard") onNavigateDashboard();
            else if (target === "report") onNavigateReport && onNavigateReport();
          }}
        />

        {/* HEADER ROW WITH ACTION BUTTONS */}
        <TrashActions
          onNavigateDashboard={onNavigateDashboard}
          trashTasks={trashTasks}
          handleRestoreAll={handleRestoreAll}
          handleClearAll={handleClearAll}
          processing={processing}
        />

        {/* TRASHED TASKS BOARD */}
        <TrashList
          loading={loading}
          trashTasks={trashTasks}
          processing={processing}
          handleRestore={handleRestore}
          handleDeletePermanent={handleDeletePermanent}
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
          overlayClass="trash-modal-overlay"
          titleClass={confirmModal.isDanger ? "text-danger" : ""}
          closeBtnClass="trash-modal-close"
          bodyTextClass="trash-modal-body-text"
          footerClass="trash-modal-footer"
          cancelBtnClass="trash-btn-modal-cancel"
          confirmBtnClass="trash-btn-modal-confirm"
        />
      </div>

      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );
}
