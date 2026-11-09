import React, { useState, useMemo, useEffect } from "react";
import CustomSelect from "../CustomSelect";

export default function UserProductivityTable({
  usersStats,
  loadingUsersStats,
  downloadingPdf,
  onDownloadPDF
}) {
  const [searchProd, setSearchProd] = useState("");
  const [sortByProd, setSortByProd] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when search or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchProd, sortByProd]);

  // Filter & sort productivity users client-side
  const filteredAndSortedUsersStats = useMemo(() => {
    let result = [...usersStats];

    if (searchProd.trim() !== "") {
      const query = searchProd.toLowerCase();
      result = result.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query))
      );
    }

    if (sortByProd === "overdue-desc") {
      result.sort((a, b) => (Number(b.overdue) || 0) - (Number(a.overdue) || 0));
    } else if (sortByProd === "prod-asc") {
      result.sort((a, b) => (Number(a.productivity) || 0) - (Number(b.productivity) || 0));
    } else if (sortByProd === "prod-desc") {
      result.sort((a, b) => (Number(b.productivity) || 0) - (Number(a.productivity) || 0));
    } else if (sortByProd === "name-asc") {
      result.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    }

    return result;
  }, [usersStats, searchProd, sortByProd]);

  const itemsPerPage = 7;
  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = filteredAndSortedUsersStats.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredAndSortedUsersStats.length / itemsPerPage);

  return (
    <div className="board-card" style={{ marginTop: "24px" }}>
      <div className="board-title" style={{ marginBottom: "16px" }}>User Productivity Table</div>
      
      {/* FILTERS FOR USER PRODUCTIVITY */}
      <div className="prod-table-filters">
        <div className="search-input-wrapper">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari user berdasarkan username atau email..."
            value={searchProd}
            onChange={(e) => setSearchProd(e.target.value)}
          />
        </div>

        <CustomSelect
          value={sortByProd}
          onChange={setSortByProd}
          options={[
            { value: "", label: "Urutkan: Default" },
            { value: "name-asc", label: "Urutkan: Nama A-Z" },
            { value: "overdue-desc", label: "Urutkan: Overdue Terbanyak" },
            { value: "prod-asc", label: "Urutkan: Produktivitas Terendah" },
            { value: "prod-desc", label: "Urutkan: Produktivitas Tertinggi" }
          ]}
          placeholder="Urutkan"
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>No</th>
              <th>Username</th>
              <th>Email</th>
              <th>Total Task</th>
              <th>Pending</th>
              <th>On Time</th>
              <th>Overdue</th>
              <th>Productivity</th>
              <th style={{ width: "100px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsersStats && usersStats.length === 0 ? (
              <tr>
                <td colSpan="9" className="admin-dash-empty-td">
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                    <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  Memuat data produktivitas...
                </td>
              </tr>
            ) : filteredAndSortedUsersStats.length === 0 ? (
              <tr>
                <td colSpan="9" className="admin-dash-empty-td">
                  {usersStats.length === 0 ? "Tidak ada data pengguna." : "Tidak ada data pengguna sesuai kriteria filter."}
                </td>
              </tr>
            ) : (
              currentRows.map((userRow, index) => {
                const globalIndex = indexOfFirstRow + index + 1;
                const prodVal = Number(userRow.productivity);
                const displayProd = userRow.total_tasks === 0 || prodVal === 0 
                  ? "0%" 
                  : `${prodVal.toFixed(1)}%`;
                
                return (
                  <tr key={userRow.id_users}>
                    <td>{globalIndex}</td>
                    <td>
                      <div className="admin-table-title">{userRow.username}</div>
                    </td>
                    <td>{userRow.email}</td>
                    <td>{userRow.total_tasks}</td>
                    <td>{userRow.pending}</td>
                    <td>{userRow.on_time}</td>
                    <td>{userRow.overdue}</td>
                    <td>
                      <span 
                        className="badge" 
                        style={{ 
                          backgroundColor: prodVal >= 75 ? "#ecfdf5" : prodVal >= 40 ? "#fffbeb" : "#fef2f2",
                          color: prodVal >= 75 ? "#059669" : prodVal >= 40 ? "#d97706" : "#dc2626",
                          fontWeight: "600"
                        }}
                      >
                        {displayProd}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-primary"
                        style={{ 
                          padding: "6px 12px", 
                          fontSize: "12px", 
                          borderRadius: "4px",
                          backgroundColor: "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          color: "#334155",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#e2e8f0";
                          e.target.style.color = "#0f172a";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#f1f5f9";
                          e.target.style.color = "#334155";
                        }}
                        onClick={() => onDownloadPDF(userRow.id_users, userRow.username)}
                        disabled={downloadingPdf[userRow.id_users]}
                      >
                        {downloadingPdf[userRow.id_users] ? "..." : "PDF"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {filteredAndSortedUsersStats.length > 0 && (
        <div className="productivity-footer">
          <div className="productivity-footer-text">
            Menampilkan {currentRows.length} dari {filteredAndSortedUsersStats.length} laporan
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
