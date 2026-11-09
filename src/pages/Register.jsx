import { useState } from "react";
import authService from "../services/authService";
import "../styles/register.css";

export default function Register({ onNavigateLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password harus minimal 8 karakter!");
      return;
    }

    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    if (!hasSpecialChar) {
      setErrorMsg("Password harus mengandung minimal 1 karakter unik/spesial!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await authService.register(username, email, password);
      if (result.success) {
        setSuccessMsg(result.message || "Pendaftaran akun berhasil! Anda kini dapat masuk.");
      } else {
        throw new Error(result.message || "Gagal melakukan registrasi.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="auth-header">
          <a href="/" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
            <img
              src="/favicon.svg"
              alt="DoneRight"
              style={{ width: "48px", height: "48px", objectFit: "contain", margin: "0 auto 12px", display: "block" }}
            />
            <h1>Daftar Akun</h1>
            <p>Sistem Manajemen Tugas Mahasiswa</p>
          </a>
        </div>

        <div className="auth-card">
          <h2>Registrasi</h2>
          
          {errorMsg && (
            <div className="auth-error-msg">
              ⚠ {errorMsg}
            </div>
          )}
 
          {successMsg ? (
            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <div style={{ color: "#10b981", fontSize: "16px", marginBottom: "16px", fontWeight: "600" }}>
                ✓ Pendaftaran Berhasil!
              </div>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: "1.6" }}>
                Kami telah mengirimkan tautan verifikasi ke email <strong>{email}</strong>. 
                Silakan buka email Anda dan klik tombol verifikasi untuk mengaktifkan akun Anda sebelum masuk.
              </p>
              <button 
                type="button" 
                className="btn-primary auth-submit-btn"
                onClick={onNavigateLogin}
                style={{ marginTop: "0" }}
              >
                Kembali ke Halaman Masuk
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="username">Nama Lengkap Anda</label>
    
                  <input
                    type="text"
                    id="username"
                    className="form-input"
                    placeholder="Masukkan nama Anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
    
                <div className="form-group">
                  <label htmlFor="email">Alamat Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
    
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="auth-password-container" style={{ marginBottom: password ? "10px" : "20px" }}>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      id="password"
                      className="form-input"
                      placeholder="Minimal 8 karakter dengan 1 karakter unik"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      title={passwordVisible ? "Sembunyikan" : "Tampilkan"}
                    >
                      {passwordVisible ? (
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
                  {/* PASSWORD REQUIREMENTS REAL-TIME INDICATOR */}
                  {password && (
                    <div className="password-checker-container">
                      <div className="password-checker-title">Persyaratan Kata Sandi:</div>
                      <div className={`password-checker-item ${password.length >= 8 ? "is-valid" : "is-invalid"}`}>
                        <span className="checker-icon">
                          {password.length >= 8 ? "✓" : "○"}
                        </span>
                        <span>Minimal 8 karakter</span>
                      </div>
                      <div className={`password-checker-item ${/[^a-zA-Z0-9]/.test(password) ? "is-valid" : "is-invalid"}`}>
                        <span className="checker-icon">
                          {/[^a-zA-Z0-9]/.test(password) ? "✓" : "○"}
                        </span>
                        <span>Minimal 1 karakter unik/spesial (misal: @, #, $, !, dll)</span>
                      </div>
                    </div>
                  )}
                </div>
    
                <div className="form-group">
                  <label htmlFor="confirmPassword">Konfirmasi Password</label>
                  <div className="auth-password-container" style={{ marginBottom: password ? "10px" : "20px" }}>
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      id="confirmPassword"
                      className="form-input"
                      placeholder="Masukkan ulang password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading || !password}
                    />
                    <button
                      type="button"
                      className="auth-eye-btn"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      title={confirmPasswordVisible ? "Sembunyikan" : "Tampilkan"}
                      disabled={!password}
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
                  {/* CONFIRMATION MATCH STATUS */}
                  {password && (
                    <div className="password-confirm-status">
                      {!confirmPassword ? (
                        <div className="confirm-status-item is-warning">
                          <span className="status-icon">⚠</span>
                          <span>Konfirmasi kata sandi belum diisi</span>
                        </div>
                      ) : confirmPassword !== password ? (
                        <div className="confirm-status-item is-invalid">
                          <span className="status-icon">✗</span>
                          <span>Konfirmasi kata sandi tidak cocok</span>
                        </div>
                      ) : (
                        <div className="confirm-status-item is-valid">
                          <span className="status-icon">✓</span>
                          <span>Konfirmasi kata sandi cocok</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
    
                <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? "Loading..." : "Daftar"}
                </button>
              </form>
    
              <div className="auth-footer">
                Sudah punya akun?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
                  Masuk di sini
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
