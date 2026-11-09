import { useState } from "react";
import "../styles/login.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ResetPassword({ resetToken, onNavigateLogin, onNavigateLanding }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password baru harus minimal 8 karakter!");
      return;
    }

    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    if (!hasSpecialChar) {
      setErrorMsg("Password baru harus mengandung minimal 1 karakter unik/spesial!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password baru dan konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengatur ulang password.");
      }

      setSuccessMsg(data.message || "Password berhasil diatur ulang.");
    } catch (err) {
      console.error("Reset password error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat mengatur ulang password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-body">
      <div className="auth-container">
        <div className="auth-header">
          <a
            href="/"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
              if (onNavigateLanding) {
                e.preventDefault();
                onNavigateLanding();
              }
            }}
            style={{ textDecoration: "none", color: "inherit", display: "block", cursor: "pointer" }}
          >
            <img
              src="/favicon.svg"
              alt="DoneRight"
              style={{ width: "48px", height: "48px", objectFit: "contain", margin: "0 auto 12px", display: "block" }}
            />
            <h1>DoneRight</h1>
            <p>Sistem Manajemen Tugas Mahasiswa</p>
          </a>
        </div>

        <div className="auth-card">
          <h2>Atur Ulang Password</h2>

          {errorMsg && (
            <div className="auth-error-msg">
              ⚠ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: "#10b981", fontSize: "14px", marginBottom: "16px", fontWeight: 500 }}>
              ✓ {successMsg}
            </div>
          )}

          {!successMsg ? (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px", lineHeight: "1.5" }}>
                Masukkan password baru Anda di bawah ini untuk mengatur ulang akses akun Anda.
              </p>

              <div className="form-group">
                <label htmlFor="password">Password Baru</label>
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
                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                <div className="auth-password-container" style={{ marginBottom: password ? "10px" : "20px" }}>
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    id="confirmPassword"
                    className="form-input"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
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
                {loading ? "Loading..." : "Atur Ulang Password"}
              </button>
            </form>
          ) : (
            <button 
              type="button" 
              className="btn-primary auth-submit-btn"
              onClick={onNavigateLogin}
            >
              Kembali ke Login
            </button>
          )}

          {!successMsg && (
            <div className="auth-footer" style={{ marginTop: "20px" }}>
              Kembali ke{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
                Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
