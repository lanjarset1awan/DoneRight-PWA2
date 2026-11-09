import React, { useState, useMemo, useEffect } from "react";
import CustomSelect from "../CustomSelect";

export default function UserAccountsTable({
  usersList,
  loadingUsersList,
  currentUser,
  onSoftDeleteUser,
  onRestoreUser
}) {
  const [searchUser, setSearchUser] = useState("");
  const [sortByUser, setSortByUser] = useState("");
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);

  // Reset user page when search or sorting changes
  useEffect(() => {
    setUsersCurrentPage(1);
  }, [searchUser, sortByUser]);

  // Filter & sort users list client-side
  const filteredAndSortedUsersList = useMemo(() => {
    let result = [...usersList];

    if (searchUser.trim() !== "") {
      const query = searchUser.toLowerCase();
      result = result.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query))
      );
    }

    if (sortByUser === "name-asc") {
      result.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    } else if (sortByUser === "name-desc") {
      result.sort((a, b) => (b.username || "").localeCompare(a.username || ""));
    } else if (sortByUser === "status-active") {
      result.sort((a, b) => {
        const aActive = !a.deleted_at;
        const bActive = !b.deleted_at;
        if (aActive === bActive) return 0;
        return aActive ? -1 : 1;
      });
    } else if (sortByUser === "status-inactive") {
      result.sort((a, b) => {
        const aActive = !a.deleted_at;
        const bActive = !b.deleted_at;
        if (aActive === bActive) return 0;
        return aActive ? 1 : -1;
      });
    }

    return result;
  }, [usersList, searchUser, sortByUser]);

  const uItemsPerPage = 7;
  const uIndexOfLastRow = usersCurrentPage * uItemsPerPage;
  const uIndexOfFirstRow = uIndexOfLastRow - uItemsPerPage;
  const uCurrentRows = filteredAndSortedUsersList.slice(uIndexOfFirstRow, uIndexOfLastRow);
  const uTotalPages = Math.ceil(filteredAndSortedUsersList.length / uItemsPerPage);

  return (
    <div className="board-card">
      <div className="board-header" style={{ marginBottom: "20px", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
        <div className="board-title">Kelola Akun User</div>
        <p style={{ fontSize: "14px", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
          Gunakan panel ini untuk menonaktifkan (<i>soft delete</i>) atau memulihkan kembali akun pengguna DoneRight. Akun pengguna yang dinonaktifkan tidak akan dapat masuk (<i>login</i>) ke sistem.
        </p>
      </div>

      {/* FILTERS FOR USER ACCOUNTS */}
      <div className="prod-table-filters" style={{ marginTop: "0px", marginBottom: "20px" }}>
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
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
        </div>

        <CustomSelect
          value={sortByUser}
          onChange={setSortByUser}
          options={[
            { value: "", label: "Urutkan: Default" },
            { value: "name-asc", label: "Urutkan: Nama A-Z" },
            { value: "name-desc", label: "Urutkan: Nama Z-A" },
            { value: "status-active", label: "Urutkan: Status Aktif" },
            { value: "status-inactive", label: "Urutkan: Status Nonaktif" }
          ]}
          placeholder="Urutkan"
        />
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "60px" }}>No</th>
              <th style={{ width: "80px" }}>Avatar</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ width: "160px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsersList && usersList.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-dash-empty-td">
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                    <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  Memuat data user...
                </td>
              </tr>
            ) : filteredAndSortedUsersList.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-dash-empty-td">
                  {usersList.length === 0 ? "Tidak ada data user terdaftar." : "Tidak ada data user sesuai kriteria filter."}
                </td>
              </tr>
            ) : (
              uCurrentRows.map((userRow, index) => {
                const globalIndex = uIndexOfFirstRow + index + 1;
                const isSelf = currentUser && currentUser.id_users === userRow.id_users;
                const isActive = !userRow.deleted_at;

                return (
                  <tr key={userRow.id_users}>
                    <td>{globalIndex}</td>
                    <td>
                      {userRow.avatar ? (
                        <img 
                          src={userRow.avatar} 
                          alt="Avatar" 
                          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            backgroundColor: "#f1f5f9", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            color: "#64748b",
                            fontSize: "12px",
                            fontWeight: "600",
                            border: "1px solid #cbd5e1"
                          }}
                        >
                          {userRow.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="admin-table-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {userRow.username} 
                        {isSelf && (
                          <span style={{ 
                            fontSize: "11px", 
                            backgroundColor: "#ede9fe", 
                            color: "var(--primary-color)", 
                            fontWeight: "600",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            Anda
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{userRow.email}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{
                          backgroundColor: userRow.role === "admin" ? "#f3e8ff" : "#f1f5f9",
                          color: userRow.role === "admin" ? "#7c3aed" : "#475569",
                          fontWeight: "600"
                        }}
                      >
                        {userRow.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {isActive ? (
                        <span className="badge badge-active">AKTIF</span>
                      ) : (
                        <span className="badge badge-overdue">NONAKTIF</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {isSelf ? (
                        <span style={{ fontSize: "13px", color: "#94a3b8", fontStyle: "italic" }}>Tidak ada aksi</span>
                      ) : isActive ? (
                        <button
                          className="btn-batal"
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            borderRadius: "6px",
                            border: "1px solid #fee2e2",
                            backgroundColor: "#fff5f5",
                            color: "#ef4444",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#fee2e2";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#fff5f5";
                          }}
                          onClick={() => onSoftDeleteUser(userRow.id_users, userRow.username)}
                        >
                          Nonaktifkan
                        </button>
                      ) : (
                        <button
                          className="btn-primary"
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "12px", 
                            borderRadius: "6px",
                            border: "1px solid var(--primary-color)",
                            backgroundColor: "#f5f3ff",
                            color: "var(--primary-color)",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#ede9fe";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "#f5f3ff";
                          }}
                          onClick={() => onRestoreUser(userRow.id_users, userRow.username)}
                        >
                          Pulihkan
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {filteredAndSortedUsersList.length > 0 && (
        <div className="productivity-footer">
          <div className="productivity-footer-text">
            Menampilkan {uCurrentRows.length} dari {filteredAndSortedUsersList.length} user
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setUsersCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={usersCurrentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: uTotalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`pagination-btn ${usersCurrentPage === pageNum ? "active" : ""}`}
                onClick={() => setUsersCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setUsersCurrentPage((prev) => Math.min(prev + 1, uTotalPages))}
              disabled={usersCurrentPage === uTotalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
