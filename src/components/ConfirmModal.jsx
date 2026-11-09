import React from "react";

export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  isDanger = true,
  isCategoryDelete = false,
  onConfirm,
  onCancel,
  onKeepTasks,
  onDeleteTasks,
  closingModal,
  closeModal,
  // Class overrides to match original stylesheets perfectly
  overlayClass = "",
  titleClass = "",
  closeBtnClass = "",
  bodyTextClass = "",
  footerClass = "",
  cancelBtnClass = "",
  confirmBtnClass = "",
  style = {}
}) {
  if (!show) return null;

  return (
    <div 
      className={`modal-overlay active ${closingModal === "confirm" ? "closing" : ""} ${overlayClass}`} 
      style={style}
    >
      <div className="modal-content" style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <div className={`modal-title ${titleClass}`}>
            {title}
          </div>
          <button
            type="button"
            className={`btn-close-modal ${closeBtnClass}`}
            onClick={() => closeModal("confirm")}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p className={bodyTextClass}>
            {message}
          </p>
        </div>
        <div className={`modal-footer ${footerClass}`}>
          {isCategoryDelete ? (
            <>
              <button
                type="button"
                className="btn-hapus-modal dashboard-cat-del-btn-option"
                onClick={() => {
                  if (onDeleteTasks) onDeleteTasks();
                  closeModal("confirm");
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ fill: "none" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Kategori & Seluruh Tugas
              </button>
              <button
                type="button"
                className="btn-hapus-modal dashboard-cat-del-btn-option"
                onClick={() => {
                  if (onKeepTasks) onKeepTasks();
                  closeModal("confirm");
                }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ fill: "none" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Kategori Saja (Simpan Tugas)
              </button>
              <button
                type="button"
                className="btn-batal dashboard-cat-del-btn-cancel"
                onClick={() => closeModal("confirm")}
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`btn-batal ${cancelBtnClass}`}
                onClick={() => {
                  if (onCancel) onCancel();
                  closeModal("confirm");
                }}
                style={{ margin: 0, padding: "10px 20px" }}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`${isDanger ? "btn-hapus-modal" : "btn-simpan"} ${confirmBtnClass}`}
                onClick={() => {
                  if (onConfirm) onConfirm();
                  closeModal("confirm");
                }}
                style={{ margin: 0, padding: "10px 24px", display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "center" }}
              >
                {isDanger && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ fill: "none" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                {confirmText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
