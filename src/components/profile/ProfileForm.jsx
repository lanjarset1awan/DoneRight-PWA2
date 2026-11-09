import React from "react";

export default function ProfileForm({
  handleSubmit,
  username,
  setUsername,
  nim,
  setNim,
  kelompok,
  setKelompok,
  prodi,
  setProdi,
  email,
  setEmail,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  newPasswordVisible,
  setNewPasswordVisible,
  confirmPasswordVisible,
  setConfirmPasswordVisible,
  loading,
  handleCancelEdit,
}) {
  return (
    <form onSubmit={handleSubmit}>
      {/* NAMA LENGKAP */}
      <div className="form-group">
        <label className="profile-label">Nama Lengkap *</label>
        <input
          type="text"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan nama lengkap"
          required
          disabled={loading}
        />
      </div>

      {/* NIM */}
      <div className="form-group">
        <label className="profile-label">NIM (Nomor Induk Mahasiswa) *</label>
        <input
          type="text"
          className="form-input"
          value={nim}
          onChange={(e) => setNim(e.target.value)}
          placeholder="Contoh: 21120122140123"
          required
          disabled={loading}
        />
      </div>

      {/* KELOMPOK */}
      <div className="form-group">
        <label className="profile-label">Kelompok Praktikum *</label>
        <input
          type="text"
          className="form-input"
          value={kelompok}
          onChange={(e) => setKelompok(e.target.value)}
          placeholder="Contoh: Kelompok 05"
          required
          disabled={loading}
        />
      </div>

      {/* PROGRAM STUDI */}
      <div className="form-group">
        <label className="profile-label">Program Studi</label>
        <input
          type="text"
          className="form-input"
          value={prodi}
          onChange={(e) => setProdi(e.target.value)}
          placeholder="Contoh: Teknik Komputer"
          disabled={loading}
        />
      </div>

      {/* EMAIL */}
      <div className="form-group">
        <label className="profile-label">Alamat Email *</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          required
          disabled={loading}
        />
      </div>

      {/* KATA SANDI BARU */}
      <div className="form-group">
        <label className="profile-label">Kata Sandi Baru</label>
        <div className="profile-field-container" style={{ marginBottom: newPassword ? "10px" : "20px" }}>
          <input
            type={newPasswordVisible ? "text" : "password"}
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Kosongkan jika tidak ingin mengubah"
            disabled={loading}
          />
          <button
            type="button"
            className="profile-eye-btn"
            onClick={() => setNewPasswordVisible(!newPasswordVisible)}
          >
            {newPasswordVisible ? (
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

      {/* KONFIRMASI KATA SANDI BARU */}
      {newPassword && (
        <div className="form-group">
          <label className="profile-label">Konfirmasi Kata Sandi Baru</label>
          <div className="profile-field-container" style={{ marginBottom: "20px" }}>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi kata sandi baru"
              disabled={loading}
            />
            <button
              type="button"
              className="profile-eye-btn"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? (
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
      )}

      {/* EDIT MODE ACTION BUTTONS */}
      <button
        type="submit"
        className="profile-action-btn profile-btn-save"
        disabled={loading}
        style={{ width: "100%", padding: "12px" }}
      >
        {loading ? "Menyimpan..." : "SIMPAN PERUBAHAN"}
      </button>

      <button
        type="button"
        className="profile-action-btn profile-btn-cancel"
        onClick={handleCancelEdit}
        disabled={loading}
        style={{ width: "100%", padding: "12px", marginTop: "12px" }}
      >
        Batal
      </button>
    </form>
  );
}
