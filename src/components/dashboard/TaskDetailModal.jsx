import React from "react";

export default function TaskDetailModal({
  show,
  selectedTask,
  task,
  closingModal,
  closeModal,
  onDeleteTask,
  handleDeleteTask,
  onEditTask,
  openEditTask,
}) {
  const currentTask = selectedTask || task;
  const handleDelete = onDeleteTask || handleDeleteTask;
  const handleEdit = onEditTask || openEditTask;

  if (!show || !currentTask) return null;

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const formatted = typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;
      const d = new Date(formatted);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateStr);
    }
  };

  const isOverdue = () => {
    if (!currentTask.deadline) return false;
    try {
      const formatted = typeof currentTask.deadline === "string" ? currentTask.deadline.replace(" ", "T") : currentTask.deadline;
      const d = new Date(formatted);
      return !currentTask.is_completed && d < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div
      className={`modal-overlay active ${closingModal === "detail" ? "closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && closeModal) {
          closeModal("detail");
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-title">Detail Tugas</div>
          <button
            type="button"
            className="btn-close-modal dashboard-modal-close"
            onClick={() => closeModal && closeModal("detail")}
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="detail-grid dashboard-detail-grid">
            <div className="detail-item dashboard-detail-item-full">
              <span className="detail-label">Judul</span>
              <span className="detail-value dashboard-detail-title">{currentTask.title || "-"}</span>
            </div>

            <div className="detail-item dashboard-detail-item-full">
              <span className="detail-label">Deskripsi</span>
              <span className="detail-value detail-value-span dashboard-detail-desc">
                {currentTask.description || "-"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Kategori</span>
              <span className="detail-value">
                {currentTask.category_name
                  ? String(currentTask.category_name).charAt(0).toUpperCase() +
                    String(currentTask.category_name).slice(1)
                  : "-"}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Prioritas</span>
              <span className={`badge badge-${(currentTask.priority || "medium").toLowerCase()} dashboard-detail-badge`}>
                {(currentTask.priority || "medium").toUpperCase()}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Deadline</span>
              <span className="detail-value">
                {formatDeadline(currentTask.deadline)}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Status</span>
              <div className="dashboard-detail-status-wrapper">
                {currentTask.is_completed ? (
                  <span className="badge badge-completed dashboard-detail-badge">✓ Selesai</span>
                ) : isOverdue() ? (
                  <span className="badge badge-overdue dashboard-detail-badge">⚠ Overdue</span>
                ) : (
                  <span
                    className="badge badge-pending dashboard-detail-badge"
                    style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#64748b", fontWeight: 600 }}
                  >
                    Aktif
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          {handleDelete && (
            <button
              type="button"
              className="btn-hapus-modal"
              onClick={() => {
                if (closeModal) closeModal("detail");
                handleDelete(currentTask.id_tasks);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus
            </button>
          )}
          {handleEdit && (
            <button
              type="button"
              className="btn-edit-modal"
              onClick={() => {
                handleEdit(currentTask);
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          )}
          <button
            type="button"
            className="btn-batal"
            onClick={() => closeModal && closeModal("detail")}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
