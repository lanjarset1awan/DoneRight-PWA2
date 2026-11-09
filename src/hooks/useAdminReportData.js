import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { downloadTextAsPDF } from "../utils/pdfGenerator";

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
    setLoading(true);
    try {
      const now = new Date();

      // Query registered users count
      const { data: users, error: userErr } = await supabase
        .from("users")
        .select("id_users");

      if (userErr) throw userErr;

      // Query active tasks
      const { data: tasks, error: taskErr } = await supabase
        .from("tasks")
        .select("*")
        .is("deleted_at", null);

      if (taskErr) throw taskErr;

      const allTasks = tasks || [];
      const total_tasks = allTasks.length;
      const completed_tasks = allTasks.filter((t) => t.is_completed).length;

      let on_time = 0;
      let overdue = 0;

      allTasks.forEach((t) => {
        const deadlineStr = t.deadline
          ? typeof t.deadline === "string"
            ? t.deadline.replace(" ", "T")
            : t.deadline
          : null;
        const deadline = deadlineStr ? new Date(deadlineStr) : null;
        const completedAt = t.completed_at ? new Date(t.completed_at) : null;

        if (t.is_completed) {
          if (!deadline || (completedAt && completedAt <= deadline)) {
            on_time++;
          } else {
            overdue++;
          }
        } else {
          if (deadline && deadline < now) {
            overdue++;
          }
        }
      });

      const productivity = total_tasks > 0 ? Math.round((on_time / total_tasks) * 100) : 0;

      setStats({
        total_users: users?.length || 0,
        total_tasks,
        completed_tasks,
        on_time,
        overdue,
        productivity,
      });
    } catch (err) {
      console.error("Fetch global report error from Supabase:", err);
      showToast("Gagal memuat data laporan global dari database.", "error");
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
      const printContent = `
============================================================
              DONERIGHT - LAPORAN SISTEM GLOBAL
                 PROGRESSIVE WEB APP (PWA II)
============================================================

Data Sistem Global:
- Tanggal Cetak : ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}
- Total Pengguna Terdaftar : ${stats?.total_users || 0} user
- Total Tugas Keseluruhan  : ${stats?.total_tasks || 0} tugas
- Tugas Selesai            : ${stats?.completed_tasks || 0} tugas
- Selesai Tepat Waktu      : ${stats?.on_time || 0} tugas
- Terlambat (Overdue)      : ${stats?.overdue || 0} tugas
- Global Productivity Rate : ${stats?.productivity || 0}%
============================================================
`.trim();

      downloadTextAsPDF(`Laporan_Sistem_Global_${new Date().toISOString().split("T")[0]}.pdf`, printContent);
      showToast("Laporan global berhasil diunduh!", "success");
    } catch (err) {
      console.error("Global report download error:", err);
      showToast("Gagal mengunduh laporan global.", "error");
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
    completionRate,
  };
}
