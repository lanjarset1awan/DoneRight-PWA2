import { useState, useEffect } from "react";

export default function CategoryModal({
  show,
  closingModal,
  closeModal,
  categories,
  categorySubmitting,
  onSubmit,
  onDeleteCategory
}) {
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  // Clear state when modal closes
  useEffect(() => {
    if (!show) {
      setCategoryName("");
      setEditingCategory(null);
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, {
      editingCategory,
      categoryName
    }, () => {
      // Success callback to reset state
      setEditingCategory(null);
      setCategoryName("");
    });
  };

  const handleClose = () => {
    closeModal("category");
    setCategoryName("");
    setEditingCategory(null);
  };

  if (!show) return null;

  return (
    <div className={`modal-overlay active ${closingModal === "category" ? "closing" : ""}`}>
      <div className="modal-content" style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <div className="modal-title">Kelola Kategori</div>
          <button
            type="button"
            className="btn-close-modal dashboard-modal-close"
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group dashboard-manage-cats-group">
              <label className="dashboard-manage-cats-label">
                {editingCategory ? `Edit Kategori "${editingCategory.name}" *` : "Tambah Kategori Baru *"}
              </label>
              <div className="dashboard-manage-cats-input-row">
                <input
                  type="text"
                  className="form-input dashboard-manage-cats-input"
                  placeholder="Masukkan nama kategori"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  disabled={categorySubmitting}
                />
                <button type="submit" className="btn-simpan dashboard-manage-cats-btn-add" disabled={categorySubmitting}>
                  {categorySubmitting ? "..." : editingCategory ? "Simpan" : "Tambah"}
                </button>
                {editingCategory && (
                  <button
                    type="button"
                    className="btn-batal dashboard-manage-cats-btn-close"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryName("");
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>

            <hr className="dashboard-manage-cats-divider" />

            <div className="form-group dashboard-manage-cats-list-container">
              <label className="dashboard-manage-cats-list-title">Daftar Kategori Kustom</label>
              {categories.filter(cat => !cat.is_global).length === 0 ? (
                <p className="dashboard-manage-cats-empty">Belum ada kategori kustom.</p>
              ) : (
                <div className="dashboard-manage-cats-list">
                  {categories.filter(cat => !cat.is_global).map((cat) => (
                    <div
                      key={cat.id_categories}
                      className="dashboard-manage-cats-item"
                    >
                      <span className="dashboard-manage-cats-item-name">
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                      </span>
                      <div className="dashboard-manage-cats-item-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryName(cat.name);
                          }}
                          className="dashboard-manage-cats-item-btn dashboard-manage-cats-item-btn-edit"
                          title="Edit Kategori"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id_categories)}
                          className="dashboard-manage-cats-item-btn dashboard-manage-cats-item-btn-delete"
                          title="Hapus Kategori"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer dashboard-manage-cats-footer">
            <button
              type="button"
              className="btn-batal dashboard-manage-cats-footer-btn"
              onClick={handleClose}
            >
              Tutup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
