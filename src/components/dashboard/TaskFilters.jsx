import React from "react";
import CustomSelect from "../CustomSelect";

export default function TaskFilters({
  viewMode,
  setViewMode,
  setShowCategoryModal,
  openAddTask,
  search,
  setSearch,
  filterCategory,
  setFilterCategory,
  categories,
  filterPriority,
  setFilterPriority,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="board-card">
      <div className="board-header">
        <div className="dashboard-actions-left">
          <div className="board-title">Daftar Tugas</div>

          <div className="dashboard-viewmode-switcher">
            <button
              onClick={() => setViewMode("list")}
              className={`dashboard-viewmode-btn ${viewMode === "list" ? "active" : ""}`}
            >
              Daftar
            </button>

            <button
              onClick={() => setViewMode("grouped")}
              className={`dashboard-viewmode-btn ${viewMode === "grouped" ? "active" : ""}`}
            >
              Per Kategori
            </button>
          </div>
        </div>
        <div className="btn-group-row">
          <button
            className="btn-secondary dashboard-btn-admin"
            onClick={() => setShowCategoryModal(true)}
          >
            <span className="btn-icon-add">+</span> Kategori
          </button>
          <button className="btn-primary dashboard-btn-add" onClick={openAddTask}>
            <span className="btn-icon-add">+</span> Tambah Tugas
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-grid">
        <input
          type="text"
          className="filter-input"
          placeholder="Cari tugas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <CustomSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: "", label: "Semua Kategori" },
            { value: "null", label: "Tanpa Kategori" },
            ...categories.map((cat) => ({
              value: cat.id_categories,
              label: cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
            }))
          ]}
          placeholder="Pilih Kategori"
        />

        <CustomSelect
          value={filterPriority}
          onChange={setFilterPriority}
          options={[
            { value: "", label: "Semua Prioritas" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" }
          ]}
          placeholder="Pilih Prioritas"
        />

        <CustomSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: "", label: "Semua Status" },
            { value: "done", label: "Selesai" },
            { value: "pending", label: "Belum Selesai" },
            { value: "overdue", label: "Overdue" }
          ]}
          placeholder="Pilih Status"
        />

        <CustomSelect
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "deadline", label: "Urutkan: Deadline" },
            { value: "priority", label: "Urutkan: Prioritas" },
            { value: "newest", label: "Urutkan: Terbaru" }
          ]}
          placeholder="Urutkan"
        />
      </div>
    </div>
  );
}
