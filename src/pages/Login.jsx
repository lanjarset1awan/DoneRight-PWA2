import { useState } from "react";
import authService from "../services/authService";
import "../styles/login.css";

export default function Login({
  onLoginSuccess,
  onNavigateRegister,
  onNavigateForgotPassword,
  onNavigateLanding,
  verificationSuccess,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        onLoginSuccess(result.token, result.user, password);
      } else {
        throw new Error(result.message || "Email atau password salah.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat masuk.");
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
          <h2>Login</h2>

          {errorMsg && (
            <div className="auth-error-msg">
              ⚠ {errorMsg}
            </div>
          )}

          {verificationSuccess && !errorMsg && (
            <div style={{ color: "#10b981", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "16px", fontWeight: 500, lineHeight: "1.5" }}>
              ✓ Akun Anda berhasil diverifikasi! Silakan masuk menggunakan email dan password Anda.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateForgotPassword();
                  }}
                  style={{
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#4f46e5",
                    textDecoration: "none",
                  }}
                >
                  Lupa Password?
                </a>
              </div>
              <div className="auth-password-container">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  className="form-input"
                  placeholder="Masukkan password"
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
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
          </form>

          <div className="auth-footer">
            Belum punya akun?{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateRegister(); }}>
              Daftar di sini
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
