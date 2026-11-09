import { useState, useEffect } from "react";
import reportService from "../services/reportService";
import userService from "../services/userService";

export default function useUserReportData(token) {
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

  const fetchStats = async () => {
    try {
      const data = await reportService.getReportStats();
      setStats(data);
    } catch (err) {
      console.error("Personal report load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const user = userService.getUserProfile();
      await reportService.downloadReportPDF(user);
      showToast("Laporan Produktivitas berhasil diunduh!", "success");
    } catch (err) {
      console.error("Report download error:", err);
      showToast("Gagal mengunduh laporan produktivitas.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const productivity = stats ? stats.productivity || 0 : 0;

  return {
    stats,
    loading,
    downloading,
    toast,
    handleDownloadPDF,
    productivity,
  };
}
