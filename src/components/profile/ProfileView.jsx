import React from "react";

export default function ProfileView({
  user,
  setIsEditing,
  currentPasswordVisible,
  setCurrentPasswordVisible,
  plaintextPassword,
  setShowDeleteConfirm,
}) {
  const studentName = user ? (user.nama || user.username || "Mahasiswa Praktikan") : "Mahasiswa Praktikan";
  const studentNim = user ? (user.nim || "21120122140123") : "21120122140123";
  const studentKelompok = user ? (user.kelompok || "Kelompok 05") : "Kelompok 05";
  const studentProdi = user ? (user.prodi || "Teknik Komputer") : "Teknik Komputer";
  const studentEmail = user ? (user.email || "mahasiswa@student.undip.ac.id") : "mahasiswa@student.undip.ac.id";

  return (
    <div>
      {/* NAMA LENGKAP */}
      <div className="form-group">
        <label className="profile-label">Nama Lengkap</label>
        <input
          type="text"
          className="form-input profile-input-readonly"
          value={studentName}
          readOnly
        />
      </div>

      {/* NIM */}
      <div className="form-group">
        <label className="profile-label">NIM (Nomor Induk Mahasiswa)</label>
        <input
          type="text"
          className="form-input profile-input-readonly"
          value={studentNim}
          readOnly
        />
      </div>

      {/* KELOMPOK */}
      <div className="form-group">
        <label className="profile-label">Kelompok Praktikum</label>
        <input
          type="text"
          className="form-input profile-input-readonly"
          value={studentKelompok}
          readOnly
        />
      </div>

      {/* PROGRAM STUDI */}
      <div className="form-group">
        <label className="profile-label">Program Studi</label>
        <input
          type="text"
          className="form-input profile-input-readonly"
          value={studentProdi}
          readOnly
        />
      </div>

      {/* EMAIL */}
      <div className="form-group">
        <label className="profile-label">Alamat Email</label>
        <input
          type="email"
          className="form-input profile-input-readonly"
          value={studentEmail}
          readOnly
        />
      </div>

      {/* PASSWORD */}
      <div className="form-group">
        <div className="profile-label-row">
          <label className="profile-label">Kata Sandi</label>
          <button className="profile-link-btn" onClick={() => setIsEditing(true)}>
            Ubah Kata Sandi
          </button>
        </div>
        <div className="profile-field-container">
          <input
            type={currentPasswordVisible ? "text" : "password"}
            className="form-input profile-input-readonly"
            value={
              plaintextPassword
                ? plaintextPassword
                : (currentPasswordVisible ? "Sandi dienkripsi di DB" : "••••••••")
            }
            readOnly
          />
          <button
            type="button"
            className="profile-eye-btn"
            onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
            title={currentPasswordVisible ? "Sembunyikan" : "Tampilkan"}
          >
            {currentPasswordVisible ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <button
        className="btn-edit-modal"
        onClick={() => setIsEditing(true)}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        EDIT PROFIL &amp; KREDENSIAL
      </button>

      {setShowDeleteConfirm && (
        <button
          className="btn-hapus-modal"
          onClick={() => setShowDeleteConfirm(true)}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", margin: "12px 0 0 0" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Profil ke Default
        </button>
      )}
    </div>
  );
}
