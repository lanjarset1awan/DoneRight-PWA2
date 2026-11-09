import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function useAdminReportData(token) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const fetchGlobalReport = async () => {
    try {
      const statsRes = await fetch(`${BASE_URL}/statistics/global`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Fetch report error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${BASE_URL}/statistics/pdf/global`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        showToast("Gagal mengunduh laporan PDF", "error");
        setDownloading(false);
        return;
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Sistem_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showToast("Laporan PDF berhasil diunduh!", "success");
    } catch (err) {
      console.error("Global PDF download error:", err);
      showToast("Gagal mengunduh laporan PDF global.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const total = stats ? Number(stats.total_tasks) || 0 : 0;
  const completed = stats ? Number(stats.completed_tasks) || 0 : 0;
  const onTime = stats ? Number(stats.on_time) || 0 : 0;
  const overdueCount = stats ? Number(stats.overdue) || 0 : 0;
  const completionRate = total > 0 ? Math.round((onTime / total) * 100) : 0;

  return {
    stats,
    loading,
    downloading,
    toast,
    handleDownloadPDF,
    total,
    completed,
    onTime,
    overdueCount,
    completionRate
  };
}
