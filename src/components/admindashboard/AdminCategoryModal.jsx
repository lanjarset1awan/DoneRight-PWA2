import { useState, useEffect } from "react";

export default function AdminCategoryModal({
  show,
  closingModal,
  closeModal,
  editingCategory,
  categorySubmitting,
  onSubmit
}) {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name || "");
    } else {
      setCategoryName("");
    }
  }, [editingCategory, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, categoryName);
  };

  if (!show) return null;

  return (
    <div className={`modal-overlay active ${closingModal === "category" ? "closing" : ""}`}>
      <div className="modal-content" style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <div className="modal-title">
            {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
          </div>
          <button
            type="button"
            className="btn-close-modal admin-dash-modal-close"
            onClick={() => closeModal("category")}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="dashboard-manage-cats-label">
                {editingCategory ? `Edit Nama Kategori "${editingCategory.name}" *` : "Nama Kategori *"}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan nama kategori"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                required
                disabled={categorySubmitting}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-batal"
              onClick={() => closeModal("category")}
              disabled={categorySubmitting}
            >
              Batal
            </button>
            <button type="submit" className="btn-simpan" disabled={categorySubmitting}>
              {categorySubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
