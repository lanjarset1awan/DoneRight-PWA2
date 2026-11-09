// ---------------------------------------------------------------------------
// reportService.js — Task analytics & productivity reporting.
// Computes real-time analytics from task records (both online & offline).
// ---------------------------------------------------------------------------

import taskService from "./taskService";

class ReportService {
  async getReportStats() {
    const tasks = await taskService.getTasks();
    const now = new Date();

    const total_tasks = tasks.length;
    const completed_tasks = tasks.filter((t) => t.is_completed).length;

    let on_time = 0;
    let overdue = 0;

    tasks.forEach((t) => {
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

    const productivity = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

    return {
      total_tasks,
      completed_tasks,
      on_time,
      overdue,
      productivity,
    };
  }

  async downloadReportPDF(user) {
    const stats = await this.getReportStats();
    const studentName = user?.nama || user?.username || "Lanjar Setiawan";
    const studentNim = user?.nim || "21120124120023";
    const studentKelompok = user?.kelompok || "Kelompok 16";

    const reportContent = `
============================================================
              DONERIGHT - LAPORAN PRODUKTIVITAS
                PROGRESSIVE WEB APP (PWA II)
============================================================

Data Mahasiswa:
- Nama Lengkap : ${studentName}
- NIM          : ${studentNim}
- Kelompok     : ${studentKelompok}
- Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}

------------------------------------------------------------
RINGKASAN TUGAS & PERFORMA
------------------------------------------------------------
- Total Tugas Terdaftar : ${stats.total_tasks} tugas
- Tugas Selesai         : ${stats.completed_tasks} tugas
- Selesai Tepat Waktu   : ${stats.on_time} tugas
- Terlambat / Overdue   : ${stats.overdue} tugas
- Skor Produktivitas    : ${stats.productivity}%

------------------------------------------------------------
Status PWA:
- Dukungan Offline      : Aktif (Service Worker + LocalStorage)
- Penyimpanan Cloud     : Terintegrasi Langsung ke Supabase
============================================================
`.trim();

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Produktivitas_${studentNim}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
  }
}

export default new ReportService();
