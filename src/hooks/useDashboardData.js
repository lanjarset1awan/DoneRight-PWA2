import { useState, useEffect } from "react";
import taskService from "../services/taskService";
import categoryService from "../services/categoryService";

export default function useDashboardData(token) {
  // Core states
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [viewMode, setViewMode] = useState("list");

  // Modals & Navigation
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [closingModals, setClosingModals] = useState({
    task: false,
    detail: false,
    category: false,
    confirm: false,
  });
  const [selectedTask, setSelectedTask] = useState(null); // for Detail view
  const [editingTask, setEditingTask] = useState(null); // for edit inside Task Modal

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    isDanger: true,
    isCategoryDelete: false,
    onKeepTasks: null,
    onDeleteTasks: null,
  });

  // Submission loading states
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Toast
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
      if (modalType === "task") setShowTaskModal(false);
      else if (modalType === "detail") setShowDetailModal(false);
      else if (modalType === "category") setShowCategoryModal(false);
      else if (modalType === "confirm") {
        setConfirmModal((prev) => ({ ...prev, show: false }));
      }
      setClosingModals((prev) => ({ ...prev, [modalType]: false }));
    }, 300);
  };

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error("Tasks fetch error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), fetchCategories()]);
    } catch (err) {
      console.error("Initial load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    const handleSyncUpdate = () => {
      fetchTasks();
      fetchCategories();
    };

    window.addEventListener("doneright:sync-completed", handleSyncUpdate);
    window.addEventListener("online", handleSyncUpdate);

    return () => {
      window.removeEventListener("doneright:sync-completed", handleSyncUpdate);
      window.removeEventListener("online", handleSyncUpdate);
    };
  }, []);

  // Checkbox Toggle Completion
  const handleToggleCompleted = async (id) => {
    try {
      await taskService.toggleTaskStatus(id);
      await fetchTasks();
    } catch (err) {
      console.error("Toggle completion error:", err);
    }
  };

  // Submit Task (Add or Edit)
  const handleTaskSubmit = async (e, formData) => {
    e.preventDefault();
    const { title, description, category_id, priority, deadline } = formData;

    if (!title.trim() || !priority || !deadline) {
      showToast("Kolom dengan bintang (*) wajib diisi!", "warning");
      return;
    }

    setTaskSubmitting(true);
    const bodyData = {
      title: title.trim(),
      description: (description || "").trim(),
      category_id: category_id ? parseInt(category_id, 10) : null,
      priority,
      deadline,
    };

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id_tasks, bodyData);
      } else {
        await taskService.createTask(bodyData);
      }

      closeModal("task");
      await fetchTasks();
      showToast(
        editingTask ? "Tugas berhasil diperbarui!" : "Tugas baru berhasil ditambahkan!",
        "success"
      );
    } catch (err) {
      console.error("Task submit error:", err);
      showToast(err.message || "Gagal menyimpan tugas.", "error");
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Submit Category
  const handleCategorySubmit = async (e, formData, onSuccess) => {
    e.preventDefault();
    const { editingCategory, categoryName } = formData;

    if (!categoryName.trim()) {
      showToast("Nama kategori wajib diisi!", "warning");
      return;
    }

    setCategorySubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id_categories, categoryName.trim());
      } else {
        await categoryService.createCategory(categoryName.trim());
      }

      if (onSuccess) onSuccess();
      await fetchCategories();
      await fetchTasks();
      showToast(
        editingCategory
          ? "Kategori berhasil diperbarui!"
          : "Kategori baru berhasil dibuat!",
        "success"
      );
    } catch (err) {
      console.error("Category save error:", err);
      showToast("Terjadi kesalahan saat menyimpan kategori.", "error");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Delete Category Actual
  const executeDeleteCategory = async (id, mode) => {
    try {
      await categoryService.deleteCategory(id, mode);
      await fetchCategories();
      await fetchTasks();
      showToast("Kategori berhasil dihapus!", "success");
    } catch (err) {
      console.error("Delete category error:", err);
      showToast(err.message || "Gagal menghapus kategori.", "error");
    }
  };

  // Delete Category confirmation
  const handleDeleteCategory = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Kategori",
      message:
        "Apakah Anda yakin ingin menghapus kategori ini? Pilih opsi di bawah untuk menentukan nasib tugas yang ada di dalamnya:",
      confirmText: "Hapus Kategori & Seluruh Tugas",
      cancelText: "Batal",
      isDanger: true,
      isCategoryDelete: true,
      onDeleteTasks: () => executeDeleteCategory(id, "delete_tasks"),
      onKeepTasks: () => executeDeleteCategory(id, "keep_tasks"),
      onCancel: () => {},
    });
  };

  // Delete Task Actual
  const executeDeleteTask = async (id) => {
    try {
      await taskService.softDeleteTask(id);
      closeModal("detail");
      await fetchTasks();
      showToast("Tugas dipindahkan ke keranjang sampah", "success");
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  // Delete Task confirmation
  const handleDeleteTask = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Tugas",
      message:
        "Apakah Anda yakin ingin menghapus tugas ini? Tugas ini akan dipindahkan ke keranjang sampah.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      isDanger: true,
      isCategoryDelete: false,
      onConfirm: () => executeDeleteTask(id),
      onCancel: () => {},
    });
  };

  // Open modals helper
  const openAddTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setShowDetailModal(false);
    setShowTaskModal(true);
  };

  // Calculation Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter Tasks Client-side
  const filteredTasks = tasks
    .filter((task) => {
      // Keyword filter
      const matchesKeyword =
        (task.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

      // Category filter
      let matchesCat = true;
      if (filterCategory) {
        if (filterCategory === "null") {
          matchesCat = !task.category_id;
        } else {
          matchesCat = Number(task.category_id) === Number(filterCategory);
        }
      }

      // Priority filter
      const matchesPriority = filterPriority ? task.priority === filterPriority : true;

      // Status filter
      let matchesStatus = true;
      const now = new Date();
      const deadlineStr = task.deadline && (typeof task.deadline === "string" ? task.deadline.replace(" ", "T") : task.deadline);
      const deadline = deadlineStr ? new Date(deadlineStr) : null;
      const completedAt = task.completed_at ? new Date(task.completed_at) : null;
      const isOverdue =
        deadline &&
        ((!task.is_completed && deadline < now) ||
          (task.is_completed && completedAt && completedAt > deadline));

      if (filterStatus === "pending") {
        matchesStatus = !task.is_completed && !isOverdue;
      } else if (filterStatus === "done") {
        matchesStatus = task.is_completed;
      } else if (filterStatus === "overdue") {
        matchesStatus = isOverdue;
      }

      return matchesKeyword && matchesCat && matchesPriority && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "deadline") {
        const aDeadlineStr = a.deadline && (typeof a.deadline === "string" ? a.deadline.replace(" ", "T") : a.deadline);
        const bDeadlineStr = b.deadline && (typeof b.deadline === "string" ? b.deadline.replace(" ", "T") : b.deadline);

        if (!aDeadlineStr && !bDeadlineStr) return 0;
        if (!aDeadlineStr) return 1;
        if (!bDeadlineStr) return -1;

        return new Date(aDeadlineStr) - new Date(bDeadlineStr);
      }

      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      const priorityOrder = {
        high: 0,
        medium: 1,
        low: 2,
      };

      const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (diff !== 0) return diff;

      const aDeadlineStr = a.deadline && (typeof a.deadline === "string" ? a.deadline.replace(" ", "T") : a.deadline);
      const bDeadlineStr = b.deadline && (typeof b.deadline === "string" ? b.deadline.replace(" ", "T") : b.deadline);

      if (!aDeadlineStr && !bDeadlineStr) return 0;
      if (!aDeadlineStr) return 1;
      if (!bDeadlineStr) return -1;

      return new Date(aDeadlineStr) - new Date(bDeadlineStr);
    });

  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const key = task.category_name || "Tanpa Kategori";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(task);
    return groups;
  }, {});

  return {
    tasks,
    categories,
    loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    showTaskModal,
    showDetailModal,
    setShowDetailModal,
    showCategoryModal,
    setShowCategoryModal,
    closingModals,
    selectedTask,
    setSelectedTask,
    editingTask,
    confirmModal,
    taskSubmitting,
    categorySubmitting,
    toast,
    closeModal,
    handleToggleCompleted,
    handleTaskSubmit,
    handleCategorySubmit,
    handleDeleteCategory,
    handleDeleteTask,
    openAddTask,
    openEditTask,
    totalTasks,
    completedTasks,
    progressPercent,
    filteredTasks,
    groupedTasks,
  };
}
