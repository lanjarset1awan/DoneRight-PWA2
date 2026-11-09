import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function useAdminDashboardData(token) {
  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersStats, setUsersStats] = useState([]);
  const [loadingUsersStats, setLoadingUsersStats] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState({});
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
    isDanger: true
  });
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const closeModal = (modalType) => {
    setClosingModals(prev => ({ ...prev, [modalType]: true }));
    setTimeout(() => {
      if (modalType === "category") setShowCategoryModal(false);
      else if (modalType === "confirm") setConfirmModal(prev => ({ ...prev, show: false }));
      setClosingModals(prev => ({ ...prev, [modalType]: false }));
    }, 300);
  };

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setStats(statsData);

      // 2. Overdue tasks
      const overdueRes = await fetch(`${BASE_URL}/admin/overdue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const overdueData = overdueRes.ok ? await overdueRes.json() : [];
      setOverdueTasks(overdueData);

      // 3. All tasks for priority calculation
      const tasksRes = await fetch(`${BASE_URL}/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksData = tasksRes.ok ? await tasksRes.json() : [];
      setAllTasks(tasksData);
    } catch (err) {
      console.error("Overview data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Categories load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersStats = async () => {
    setLoadingUsersStats(true);
    try {
      const res = await fetch(`${BASE_URL}/statistics/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersStats(data);
      }
    } catch (err) {
      console.error("Users productivity statistics load error:", err);
    } finally {
      setLoadingUsersStats(false);
    }
  };

  const handleDownloadUserPDF = async (userId, username) => {
    setDownloadingPdf((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch(`${BASE_URL}/statistics/pdf/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal mengunduh laporan.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Productivity_${username}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Laporan PDF ${username} berhasil diunduh!`, "success");
    } catch (err) {
      console.error("User PDF download error:", err);
      showToast(`Gagal mengunduh laporan PDF ${username}.`, "error");
    } finally {
      setDownloadingPdf((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const fetchUsersList = async () => {
    setLoadingUsersList(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Users list load error:", err);
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
          const res = await fetch(`${BASE_URL}/admin/users/${userId}/soft-delete`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            showToast(`Akun user ${username} berhasil dinonaktifkan!`, "success");
            fetchUsersList();
            fetchOverviewData();
            fetchUsersStats();
          } else {
            throw new Error();
          }
        } catch (err) {
          console.error("Soft delete user error:", err);
          showToast(`Gagal menonaktifkan akun user ${username}.`, "error");
        }
      },
      onCancel: () => {}
    });
  };

  const handleRestoreUser = async (userId, username) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/users/${userId}/restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`Akun user ${username} berhasil dipulihkan!`, "success");
        fetchUsersList();
        fetchOverviewData();
        fetchUsersStats();
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error("Restore user error:", err);
      showToast(`Gagal memulihkan akun user ${username}.`, "error");
    }
  };

  // Load overview data automatically
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

  // Submit Category
  const handleCategorySubmit = async (e, categoryName) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      showToast("Nama kategori wajib diisi!", "warning");
      return;
    }

    setCategorySubmitting(true);
    try {
      let url = `${BASE_URL}/admin/categories`;
      let method = "POST";

      if (editingCategory) {
        url = `${BASE_URL}/admin/categories/${editingCategory.id_categories}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan kategori.");

      const isEdit = !!editingCategory;
      closeModal("category");
      setEditingCategory(null);
      await fetchCategories();
      showToast(isEdit ? "Kategori global berhasil diupdate!" : "Kategori global baru berhasil ditambahkan!", "success");
    } catch (err) {
      console.error("Save global category error:", err);
      showToast("Gagal menyimpan kategori global.", "error");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete Category Actual
  const executeDeleteCategory = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal menghapus kategori.");

      await fetchCategories();
      showToast("Kategori global berhasil dihapus!", "success");
    } catch (err) {
      console.error("Delete global category error:", err);
      showToast("Gagal menghapus kategori global.", "error");
    }
  };

  // Delete Category
  const handleDeleteCategory = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Kategori Global",
      message: "Apakah Anda yakin ingin menghapus kategori global ini? Kategori kustom buatan admin ini akan dihapus dari sistem.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: () => executeDeleteCategory(id),
      onCancel: () => {}
    });
  };

  // Calculations
  const totalTasksCount = stats ? stats.total_tasks || 0 : allTasks.length;
  const completedTasksCount = stats ? stats.completed_tasks || 0 : allTasks.filter((t) => t.is_completed).length;
  const overdueCount = overdueTasks.length;
  const now = new Date();
  const activeCount = allTasks.filter((t) => {
    const deadlineStr = t.deadline && (typeof t.deadline === 'string' ? t.deadline.replace(' ', 'T') : t.deadline);
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
    lowPercent
  };
}
