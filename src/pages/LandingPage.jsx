import { useState, useEffect } from "react";
import "../styles/dashboard.css";

export default function LandingPage({ onNavigateLogin, onNavigateRegister }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      // Toggle navbar bg on scroll
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Scrollspy logic to detect active section
      const sections = ["hero", "features", "contact"];
      let currentSection = "hero";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Highlight the section if its top part is within view
          if (rect.top <= window.innerHeight / 2) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Offset for sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="landing-page-container">
      {/* NAVBAR */}
      <nav className={`landing-navbar ${isScrolled ? "scrolled" : ""}`}>
        <a href="/" className="landing-navbar-brand">
          <img
            src="/favicon.svg"
            alt="DoneRight"
            style={{ width: "30px", height: "30px", objectFit: "contain", borderRadius: "6px" }}
          />
          DoneRight
        </a>
        <div className="landing-navbar-links">
          <a
            href="#hero"
            className={activeSection === "hero" ? "active" : ""}
            onClick={(e) => handleScrollToSection(e, "hero")}
          >
            Beranda
          </a>
          <a
            href="#features"
            className={activeSection === "features" ? "active" : ""}
            onClick={(e) => handleScrollToSection(e, "features")}
          >
            Fitur Utama
          </a>
          <a
            href="#contact"
            className={activeSection === "contact" ? "active" : ""}
            onClick={(e) => handleScrollToSection(e, "contact")}
          >
            Hubungi Admin
          </a>
        </div>
        <div className="landing-navbar-actions">
          <button className="btn-masuk" onClick={onNavigateLogin}>Masuk</button>
          <button className="btn-daftar" onClick={onNavigateRegister}>Daftar</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="hero" className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">Sistem Manajemen Tugas #1</div>
          <h1 className="hero-title">
            Fokus pada pekerjaan, biarkan kami mengatur <span className="text-highlight">sisanya.</span>
          </h1>
          <p className="hero-description">
            DoneRight adalah aplikasi web to-do list yang bisa diakses dengan mudah untuk membantu Anda dalam manajemen tugas, mengatur jadwal harian, dan meningkatkan produktivitas secara terstruktur.
          </p>
          <div className="hero-actions">
            <button className="btn-cta-primary" onClick={onNavigateRegister}>
              Mulai Sekarang
            </button>
            <button className="btn-cta-secondary" onClick={(e) => handleScrollToSection(e, "features")}>
              Pelajari Fitur
            </button>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section id="features" className="landing-features">
        <div className="features-header">
          <h2 className="section-title">Semua alat untuk bekerja lebih cerdas</h2>
          <p className="section-subtitle">Didesain khusus untuk mahasiswa, profesional, dan tim yang ingin menyelesaikan lebih banyak hal dalam waktu yang lebih singkat.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3>Manajemen Terpusat</h3>
            <p>Atur seluruh jadwal Anda dengan mudah. Kategori yang fleksibel memungkinkan Anda memisahkan tugas kuliah, kerja, dan urusan pribadi secara rapi.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3>Peringatan H-1 Otomatis</h3>
            <p>Tidak ada lagi deadline yang terlewat. Sistem notifikasi pintar kami akan mengingatkan Anda saat batas waktu tugas tersisa 24 jam secara otomatis.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon feature-icon-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Laporan Produktivitas</h3>
            <p>Dapatkan wawasan tentang kebiasaan kerja Anda. Lihat berapa banyak tugas yang Anda selesaikan secara On-Time atau Overdue dan unduh dalam bentuk PDF.</p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="landing-contact">
        <div className="contact-container">
          <h2>Memiliki Masalah?</h2>
          <p>Tim support kami siap membantu Anda menyelesaikan masalah kapan saja.</p>
          <div className="contact-methods">
            <div className="contact-item">
              <div className="feature-icon feature-icon-purple" style={{ marginBottom: 0, width: "48px", height: "48px", borderRadius: "12px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="contact-info">
                <strong>Email Admin</strong>
                <a href="mailto:admin@doneright.com">admin@doneright.com</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="feature-icon feature-icon-purple" style={{ marginBottom: 0, width: "48px", height: "48px", borderRadius: "12px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="contact-info">
                <strong>WhatsApp Admin</strong>
                <a href="https://wa.me/6281234567890">+62 812-3456-7890</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="footer" className="landing-footer">
        <div className="footer-content-simple">
          <div className="footer-logo">
            <img
              src="/favicon.svg"
              alt="DoneRight"
              style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "4px" }}
            />
            <h2>DoneRight</h2>
          </div>
          <p>Sistem manajemen tugas mahasiswa yang cerdas dan terstruktur.</p>
          <div className="footer-links-simple">
            <a href="#">Syarat & Ketentuan</a>
            <span className="separator">•</span>
            <a href="#">Kebijakan Privasi</a>
          </div>
          <div className="footer-copyright">&copy; 2026 DoneRight. Seluruh hak cipta dilindungi.</div>
        </div>
      </footer>
    </div>
  );
}
