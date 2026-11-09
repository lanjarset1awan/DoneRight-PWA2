import { useState, useEffect } from "react";
import { supabase } from "../config/supabase";
import { downloadTextAsPDF } from "../utils/pdfGenerator";

export default function useAdminDashboardData(token) {
  // Tabs: 'overview', 'categories', 'users'
  const [activeTab, setActiveTab] = useState("overview");

  // Overview state
  const [stats, setStats] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Categories state
  const [categories, setCategories] = useState([]);

  // Users productivity stats state
  const [usersStats, setUsersStats] = useState([]);
  const [loadingUsersStats, setLoadingUsersStats] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState({});

  // Users account management state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsersList, setLoadingUsersList] = useState(false);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [closingModals, setClosingModals] = useState({
    category: false,
    confirm: false,
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    isDanger: true,
  });

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const closeModal = (modalType) => {
    setClosingModals((prev) => ({ ...prev, [modalType]: true }));
    setTimeout(() => {
      if (modalType === "category") setShowCategoryModal(false);
      else if (modalType === "confirm") setConfirmModal((prev) => ({ ...prev, show: false }));
      setClosingModals((prev) => ({ ...prev, [modalType]: false }));
    }, 300);
  };

  // -------------------------------------------------------------------------
  // 1. Overview Tab: Tasks Statistics & Priority Distribution
  // -------------------------------------------------------------------------
  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const { data: tasksData, error } = await supabase
        .from("tasks")
        .select("*")
        .is("deleted_at", null);

      if (error) throw error;
      const tasks = tasksData || [];

      const total_tasks = tasks.length;
      const completed_tasks = tasks.filter((t) => t.is_completed).length;

      const overdue = tasks.filter((t) => {
        const deadlineStr = t.deadline
          ? typeof t.deadline === "string"
            ? t.deadline.replace(" ", "T")
            : t.deadline
          : null;
        const deadline = deadlineStr ? new Date(deadlineStr) : null;
        const completedAt = t.completed_at ? new Date(t.completed_at) : null;

        if (t.is_completed) {
          return deadline && completedAt && completedAt > deadline;
        }
        return deadline && deadline < now;
      });

      setStats({
        total_tasks,
        completed_tasks,
        overdue: overdue.length,
      });
      setOverdueTasks(overdue);
      setAllTasks(tasks);
    } catch (err) {
      console.error("Overview data load error from Supabase:", err);
      showToast("Gagal memuat statistik overview dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // 2. Overview Tab: User Productivity Statistics
  // -------------------------------------------------------------------------
  const fetchUsersStats = async () => {
    setLoadingUsersStats(true);
    try {
      const now = new Date();

      // Query all users
      const { data: users, error: userErr } = await supabase
        .from("users")
        .select("id_users, username, email, nama, deleted_at, role")
        .order("id_users", { ascending: true });

      if (userErr) throw userErr;

      // Query all active tasks
      const { data: tasks, error: taskErr } = await supabase
        .from("tasks")
        .select("id_tasks, user_id, is_completed, deadline, completed_at")
        .is("deleted_at", null);

      if (taskErr) throw taskErr;

      const userStatsList = (users || []).map((u) => {
        const userTasks = (tasks || []).filter(
          (t) => String(t.user_id) === String(u.id_users)
        );
        const total = userTasks.length;
        const completed = userTasks.filter((t) => t.is_completed).length;
        const pending = total - completed;

        let onTime = 0;
        let overdue = 0;

        userTasks.forEach((t) => {
          const deadlineStr = t.deadline
            ? typeof t.deadline === "string"
              ? t.deadline.replace(" ", "T")
              : t.deadline
            : null;
          const deadline = deadlineStr ? new Date(deadlineStr) : null;
          const completedAt = t.completed_at ? new Date(t.completed_at) : null;

          if (t.is_completed) {
            if (!deadline || (completedAt && completedAt <= deadline)) {
              onTime++;
            } else {
              overdue++;
            }
          } else {
            if (deadline && deadline < now) {
              overdue++;
            }
          }
        });

        const productivity = total > 0 ? Math.round((onTime / total) * 100) : 0;

        return {
          id_users: u.id_users,
          username: u.username || u.nama || `User #${u.id_users}`,
          email: u.email || "-",
          total_tasks: total,
          pending,
          on_time: onTime,
          overdue,
          productivity,
          deleted_at: u.deleted_at,
          role: u.role || "user",
        };
      });

      setUsersStats(userStatsList);
    } catch (err) {
      console.error("Users productivity statistics load error from Supabase:", err);
      showToast("Gagal memuat statistik produktivitas pengguna.", "error");
    } finally {
      setLoadingUsersStats(false);
    }
  };

  const handleDownloadUserPDF = async (userId, username) => {
    setDownloadingPdf((prev) => ({ ...prev, [userId]: true }));
    try {
      const userRow = usersStats.find((u) => u.id_users === userId);
      const printContent = `
============================================================
              DONERIGHT - LAPORAN PRODUKTIVITAS USER
                    SISTEM MANAJEMEN TUGAS
============================================================

Data Pengguna:
- ID Pengguna  : ${userId}
- Username     : ${username}
- Email        : ${userRow?.email || "-"}
- Status Akun  : ${userRow?.deleted_at ? "Nonaktif (Soft Deleted)" : "Aktif"}
- Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}

------------------------------------------------------------
RINGKASAN TUGAS PENGGUNA
------------------------------------------------------------
- Total Tugas Terdaftar    : ${userRow?.total_tasks || 0} tugas
- Tugas Selesai Tepat Waktu: ${userRow?.on_time || 0} tugas
- Tugas Menunggu (Pending) : ${userRow?.pending || 0} tugas
- Tugas Terlambat (Overdue): ${userRow?.overdue || 0} tugas
- Tingkat Produktivitas    : ${userRow?.productivity || 0}%

============================================================
`.trim();

      downloadTextAsPDF(`Laporan_Produktivitas_${username}.pdf`, printContent);
      showToast(`Laporan ${username} berhasil diunduh!`, "success");
    } catch (err) {
      console.error("User PDF download error:", err);
      showToast(`Gagal mengunduh laporan ${username}.`, "error");
    } finally {
      setDownloadingPdf((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // -------------------------------------------------------------------------
  // 3. Kelola Kategori Tab: Categories CRUD
  // -------------------------------------------------------------------------
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id_categories", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
      localStorage.setItem("doneright_categories", JSON.stringify(data || []));
    } catch (err) {
      console.error("Categories load error from Supabase:", err);
      showToast("Gagal memuat kategori dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e, categoryName) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast("Nama kategori wajib diisi!", "warning");
      return;
    }

    setCategorySubmitting(true);
    try {
      const trimmed = categoryName.trim();
      let error = null;

      if (editingCategory) {
        const res = await supabase
          .from("categories")
          .update({ name: trimmed })
          .eq("id_categories", editingCategory.id_categories);
        error = res.error;
      } else {
        const res = await supabase
          .from("categories")
          .insert([{ name: trimmed }]);
        error = res.error;
      }

      if (error) throw error;

      const isEdit = !!editingCategory;
      closeModal("category");
      setEditingCategory(null);
      await fetchCategories();
      showToast(
        isEdit ? "Kategori global berhasil diupdate!" : "Kategori global baru berhasil ditambahkan!",
        "success"
      );
    } catch (err) {
      console.error("Save global category error:", err);
      showToast("Gagal menyimpan kategori global.", "error");
    } finally {
      setCategorySubmitting(false);
    }
  };

  const executeDeleteCategory = async (id) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id_categories", id);

      if (error) throw error;

      await fetchCategories();
      showToast("Kategori global berhasil dihapus!", "success");
    } catch (err) {
      console.error("Delete global category error:", err);
      showToast("Gagal menghapus kategori global.", "error");
    }
  };

  const handleDeleteCategory = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Kategori Global",
      message: "Apakah Anda yakin ingin menghapus kategori global ini? Kategori ini akan dihapus dari sistem.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: () => executeDeleteCategory(id),
      onCancel: () => {},
    });
  };

  // -------------------------------------------------------------------------
  // 4. Kelola Akun User Tab: User Accounts & Soft Delete / Restore
  // -------------------------------------------------------------------------
  const fetchUsersList = async () => {
    setLoadingUsersList(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("id_users", { ascending: true });

      if (error) throw error;
      setUsersList(data || []);
    } catch (err) {
      console.error("Users list load error from Supabase:", err);
      showToast("Gagal memuat daftar pengguna.", "error");
    } finally {
      setLoadingUsersList(false);
    }
  };

  const handleSoftDeleteUser = (userId, username) => {
    setConfirmModal({
      show: true,
      title: "Nonaktifkan Akun User",
      message: `Apakah Anda yakin ingin menonaktifkan akun user "${username}"? User ini tidak akan dapat login ke sistem.`,
      confirmText: "Ya, Nonaktifkan",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from("users")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id_users", userId);

          if (error) throw error;

          showToast(`Akun user ${username} berhasil dinonaktifkan!`, "success");
          fetchUsersList();
          fetchOverviewData();
          fetchUsersStats();
        } catch (err) {
          console.error("Soft delete user error:", err);
          showToast(`Gagal menonaktifkan akun user ${username}.`, "error");
        }
      },
      onCancel: () => {},
    });
  };

  const handleRestoreUser = async (userId, username) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ deleted_at: null })
        .eq("id_users", userId);

      if (error) throw error;

      showToast(`Akun user ${username} berhasil dipulihkan!`, "success");
      fetchUsersList();
      fetchOverviewData();
      fetchUsersStats();
    } catch (err) {
      console.error("Restore user error:", err);
      showToast(`Gagal memulihkan akun user ${username}.`, "error");
    }
  };

  // Initial Load
  useEffect(() => {
    fetchOverviewData();
    fetchUsersStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch based on Active Tab
  useEffect(() => {
    if (activeTab === "overview") {
      fetchOverviewData();
      fetchUsersStats();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "users") {
      fetchUsersList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Priority Distribution & Counts Calculations
  const totalTasksCount = stats ? stats.total_tasks || 0 : allTasks.length;
  const completedTasksCount = stats ? stats.completed_tasks || 0 : allTasks.filter((t) => t.is_completed).length;
  const overdueCount = overdueTasks.length;
  const now = new Date();
  const activeCount = allTasks.filter((t) => {
    const deadlineStr = t.deadline && (typeof t.deadline === "string" ? t.deadline.replace(" ", "T") : t.deadline);
    const deadline = deadlineStr ? new Date(deadlineStr) : null;
    const isOverdue = !t.is_completed && deadline && deadline < now;
    return !t.is_completed && !isOverdue;
  }).length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  allTasks.forEach((t) => {
    if (t.priority === "high") highCount++;
    else if (t.priority === "medium") mediumCount++;
    else if (t.priority === "low") lowCount++;
  });

  const highPercent = totalTasksCount > 0 ? (highCount / totalTasksCount) * 100 : 0;
  const mediumPercent = totalTasksCount > 0 ? (mediumCount / totalTasksCount) * 100 : 0;
  const lowPercent = totalTasksCount > 0 ? (lowCount / totalTasksCount) * 100 : 0;

  return {
    activeTab,
    setActiveTab,
    stats,
    allTasks,
    overdueTasks,
    categories,
    loading,
    usersStats,
    loadingUsersStats,
    downloadingPdf,
    usersList,
    loadingUsersList,
    showCategoryModal,
    setShowCategoryModal,
    closingModals,
    editingCategory,
    setEditingCategory,
    categorySubmitting,
    setCategorySubmitting,
    confirmModal,
    setConfirmModal,
    toast,
    showToast,
    closeModal,
    handleDownloadUserPDF,
    handleSoftDeleteUser,
    handleRestoreUser,
    handleCategorySubmit,
    handleDeleteCategory,
    totalTasksCount,
    completedTasksCount,
    overdueCount,
    activeCount,
    completionRate,
    highCount,
    mediumCount,
    lowCount,
    highPercent,
    mediumPercent,
    lowPercent,
  };
}
