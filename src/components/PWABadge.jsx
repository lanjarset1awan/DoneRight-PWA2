import { useState, useEffect } from "react";
import { Download, WifiOff, X, Smartphone, Check, Share2, MoreVertical, RefreshCw, CheckCircle2 } from "lucide-react";
import syncService from "../services/syncService";
import "../styles/components/pwa-badge.css";

/**
 * PWABadge — Progressive Web App installation prompt popup & offline / sync status indicator.
 */
export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [syncState, setSyncState] = useState(() => ({
    pendingCount: syncService.getPendingCount(),
    isSyncing: false,
    lastSync: null,
    statusText: null,
  }));
  const [justSynced, setJustSynced] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Reset dismissed if new prompt arrives
      setDismissed(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowGuideModal(false);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const unsub = syncService.subscribe((state) => {
      setSyncState(state);
    });

    const handleSyncCompleted = (e) => {
      if (e.detail?.syncedCount > 0) {
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 4000);
      }
    };

    window.addEventListener("doneright:sync-completed", handleSyncCompleted);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("doneright:sync-completed", handleSyncCompleted);
      unsub();
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      // Show interactive guided install modal
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* 1. Offline status alert banner */}
      {isOffline && (
        <aside className="pwa-badge pwa-badge--offline" role="status" aria-live="polite">
          <WifiOff size={18} className="pwa-badge-icon" />
          <div className="pwa-badge-text">
            <strong>Mode Offline</strong>: Anda sedang offline.{" "}
            {syncState.pendingCount > 0
              ? `${syncState.pendingCount} perubahan disimpan lokal & akan disinkronkan otomatis ke database saat online.`
              : "Seluruh data tugas tetap tersimpan di penyimpanan lokal."}
          </div>
        </aside>
      )}

      {/* 1b. Syncing in progress banner */}
      {!isOffline && syncState.isSyncing && (
        <aside className="pwa-badge pwa-badge--syncing" role="status" aria-live="polite">
          <RefreshCw size={18} className="pwa-badge-icon animate-spin" />
          <div className="pwa-badge-text">
            <strong>Menyinkronkan</strong>: Mengunggah {syncState.pendingCount || ""} perubahan ke database Supabase...
          </div>
        </aside>
      )}

      {/* 1c. Successfully synced toast */}
      {!isOffline && justSynced && (
        <aside className="pwa-badge pwa-badge--synced" role="status" aria-live="polite">
          <CheckCircle2 size={18} className="pwa-badge-icon" />
          <div className="pwa-badge-text">
            <strong>Tersinkron</strong>: Data berhasil diperbarui ke database Supabase!
          </div>
        </aside>
      )}

      {/* 2. Floating install popup banner (if not installed and not dismissed) */}
      {!isInstalled && !dismissed && (
        <aside className="pwa-badge pwa-badge--install" role="region" aria-label="Install App">
          <div className="pwa-badge-content">
            <img
              src="/favicon.svg"
              alt="DoneRight Logo"
              className="pwa-badge-logo"
            />
            <div className="pwa-badge-text">
              <span className="pwa-badge-title">Install DoneRight</span>
              <span className="pwa-badge-desc">
                Pasang di HP / Laptop untuk akses offline &amp; cepat.
              </span>
            </div>
          </div>
          <div className="pwa-badge-actions">
            <button
              type="button"
              className="pwa-btn pwa-btn--primary"
              onClick={handleInstallClick}
              title="Pasang aplikasi ke layar utama"
            >
              <Download size={15} />
              <span>Install App</span>
            </button>
            <button
              type="button"
              className="pwa-btn pwa-btn--close"
              onClick={() => setDismissed(true)}
              aria-label="Tutup pemberitahuan"
              title="Tutup pemberitahuan"
            >
              <X size={15} />
            </button>
          </div>
        </aside>
      )}

      {/* 3. Detailed Interactive Installation Guide Modal */}
      {showGuideModal && (
        <div className="pwa-modal-backdrop" onClick={() => setShowGuideModal(false)}>
          <div
            className="pwa-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pwa-modal-close"
              onClick={() => setShowGuideModal(false)}
              aria-label="Tutup dialog"
            >
              &times;
            </button>

            <div className="pwa-modal-header">
              <img
                src="/favicon.svg"
                alt="DoneRight Logo"
                className="pwa-modal-app-icon"
              />
              <div>
                <h3 id="pwa-modal-title" className="pwa-modal-title">
                  Pasang DoneRight PWA
                </h3>
                <p className="pwa-modal-subtitle">
                  Sistem Manajemen Tugas Mahasiswa
                </p>
              </div>
            </div>

            <div className="pwa-modal-body">
              <div className="pwa-features-list">
                <div className="pwa-feature-item">
                  <span className="pwa-feature-check">✓</span>
                  <span>Bekerja 100% offline tanpa koneksi internet</span>
                </div>
                <div className="pwa-feature-item">
                  <span className="pwa-feature-check">✓</span>
                  <span>Tampil fullscreen layaknya aplikasi bawaan smartphone</span>
                </div>
                <div className="pwa-feature-item">
                  <span className="pwa-feature-check">✓</span>
                  <span>Performa cepat tanpa loading ulang halaman web</span>
                </div>
              </div>

              <div className="pwa-steps-box">
                <div className="pwa-steps-title">
                  <Smartphone size={16} /> Cara Memasang di Smartphone:
                </div>

                <div className="pwa-step-item">
                  <div className="pwa-step-num">1</div>
                  <div className="pwa-step-desc">
                    <strong>Android (Google Chrome):</strong> Klik menu titik tiga{" "}
                    <MoreVertical size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                    di pojok kanan atas browser, lalu pilih{" "}
                    <span className="pwa-highlight">"Tambahkan ke Layar Utama"</span> atau{" "}
                    <span className="pwa-highlight">"Install Aplikasi"</span>.
                  </div>
                </div>

                <div className="pwa-step-item">
                  <div className="pwa-step-num">2</div>
                  <div className="pwa-step-desc">
                    <strong>iPhone / iPad (Safari):</strong> Klik tombol{" "}
                    <Share2 size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                    <strong>Share</strong> di bagian bawah browser, lalu pilih{" "}
                    <span className="pwa-highlight">"Add to Home Screen"</span>.
                  </div>
                </div>

                <div className="pwa-step-item">
                  <div className="pwa-step-num">3</div>
                  <div className="pwa-step-desc">
                    <strong>Komputer (Chrome / Edge):</strong> Klik ikon{" "}
                    <strong>Install</strong> <Download size={14} style={{ display: "inline", verticalAlign: "middle" }} />{" "}
                    di sebelah kanan address bar browser.
                  </div>
                </div>
              </div>
            </div>

            <div className="pwa-modal-footer">
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", fontWeight: "600" }}
                onClick={() => setShowGuideModal(false)}
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
