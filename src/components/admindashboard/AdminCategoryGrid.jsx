import React from "react";

export default function AdminCategoryGrid({
  loading,
  categories,
  setEditingCategory,
  setCategorySubmitting,
  setShowCategoryModal,
  handleDeleteCategory,
}) {
  return (
    <div className="category-cards-grid">
      {loading && categories.length === 0 ? (
        <div className="empty-state admin-dash-empty-state-full">
          <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>Memuat kategori...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state admin-dash-empty-state-full">
          <p>Tidak ada kategori global.</p>
        </div>
      ) : (
        categories.map((cat) => {
          const nameLower = cat.name.toLowerCase();
          const isDefault = nameLower === "akademik" || nameLower === "organisasi" || nameLower === "pekerjaan";
          const typeText = isDefault ? "Kategori Default" : "Kategori Custom";
          const dateText = cat.created_at ? new Date(cat.created_at).toLocaleDateString("id-ID") : "14/5/2026";

          return (
            <div className="category-admin-card" key={cat.id_categories}>
              <div className="category-admin-left">
                <span className="category-admin-name">
                  {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                </span>
                <span className="category-admin-type">{typeText}</span>
                <span className="category-admin-date">Dibuat: {dateText}</span>
              </div>
              <div className="admin-dash-cats-row">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(cat);
                    setCategorySubmitting(false);
                    setShowCategoryModal(true);
                  }}
                  className="dashboard-manage-cats-item-btn dashboard-manage-cats-item-btn-edit"
                  title="Edit Kategori"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                 <button
                   className="admin-dash-cat-del-icon"
                   onClick={() => handleDeleteCategory(cat.id_categories)}
                   title="Hapus Kategori"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
