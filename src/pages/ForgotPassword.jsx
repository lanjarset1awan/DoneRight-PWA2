import { useState } from "react";
import "../styles/login.css"; // Reuse login stylesheet for styling consistency

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ForgotPassword({ onNavigateLogin, onNavigateLanding }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Email wajib diisi!");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim permintaan reset password.");
      }

      setSuccessMsg(data.message || "Tautan reset password telah dikirim.");
    } catch (err) {
      console.error("Forgot password error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses permintaan.");
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
          <h2>Lupa Password</h2>

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
                Masukkan email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi ke email Anda.
              </p>
              
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

              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? "Loading..." : "Kirim Permintaan"}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: "10px", color: "#64748b", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
              Silakan periksa kotak masuk email Anda (termasuk folder spam jika diperlukan) dan klik tombol "Atur Ulang Kata Sandi" untuk melanjutkan.
            </div>
          )}

          <div className="auth-footer" style={{ marginTop: "20px" }}>
            Kembali ke{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateLogin(); }}>
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
