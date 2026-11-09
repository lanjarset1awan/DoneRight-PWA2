import { useState, useEffect } from "react";
import taskService from "../services/taskService";

export default function useTrashData(token) {
  const [trashTasks, setTrashTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

  const [closingModals, setClosingModals] = useState({
    confirm: false,
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const closeModal = (modalType) => {
    setClosingModals((prev) => ({ ...prev, [modalType]: true }));
    setTimeout(() => {
      if (modalType === "confirm") setConfirmModal((prev) => ({ ...prev, show: false }));
      setClosingModals((prev) => ({ ...prev, [modalType]: false }));
    }, 300);
  };

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const data = await taskService.getDeletedTasks();
      setTrashTasks(data || []);
    } catch (err) {
      console.error("Fetch trash error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();

    const handleSync = () => fetchTrash();
    window.addEventListener("doneright:sync-completed", handleSync);
    window.addEventListener("online", handleSync);

    return () => {
      window.removeEventListener("doneright:sync-completed", handleSync);
      window.removeEventListener("online", handleSync);
    };
  }, []);

  const executeRestore = async (id) => {
    setProcessing(true);
    try {
      await taskService.restoreTask(id);
      setTrashTasks((prev) => prev.filter((t) => String(t.id_tasks) !== String(id)));
      showToast("Tugas berhasil dipulihkan", "success");
    } catch (err) {
      console.error("Restore error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRestore = (id) => {
    setConfirmModal({
      show: true,
      title: "Restorasi Tugas",
      message: "Apakah Anda yakin ingin mengembalikan tugas ini ke Dashboard?",
      confirmText: "Ya, Kembalikan",
      cancelText: "Batal",
      isDanger: false,
      onConfirm: () => executeRestore(id),
      onCancel: () => {},
    });
  };

  const executeDeletePermanent = async (id) => {
    setProcessing(true);
    try {
      await taskService.permanentDeleteTask(id);
      setTrashTasks((prev) => prev.filter((t) => String(t.id_tasks) !== String(id)));
      showToast("Tugas berhasil dihapus permanen", "success");
    } catch (err) {
      console.error("Permanent delete error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePermanent = (id) => {
    setConfirmModal({
      show: true,
      title: "Hapus Permanen",
      message: "PERINGATAN! Tugas ini akan dihapus secara PERMANEN dan tidak dapat dikembalikan lagi. Anda yakin?",
      confirmText: "Ya, Hapus Permanen",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: () => executeDeletePermanent(id),
      onCancel: () => {},
    });
  };

  const executeRestoreAll = async () => {
    setProcessing(true);
    try {
      await taskService.restoreAllTasks(trashTasks.map((t) => t.id_tasks));
      await fetchTrash();
      showToast("Semua tugas berhasil dipulihkan", "success");
    } catch (err) {
      console.error("Restore all error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRestoreAll = () => {
    if (trashTasks.length === 0) return;
    setConfirmModal({
      show: true,
      title: "Pulihkan Semua Tugas",
      message: "Apakah Anda yakin ingin memulihkan SEMUA tugas di keranjang sampah kembali ke Dashboard?",
      confirmText: "Ya, Pulihkan",
      cancelText: "Batal",
      isDanger: false,
      onConfirm: () => executeRestoreAll(),
      onCancel: () => {},
    });
  };

  const executeClearAll = async () => {
    setProcessing(true);
    try {
      await taskService.emptyTrash();
      await fetchTrash();
      showToast("Keranjang sampah berhasil dikosongkan", "success");
    } catch (err) {
      console.error("Clear all error:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleClearAll = () => {
    if (trashTasks.length === 0) return;
    setConfirmModal({
      show: true,
      title: "Kosongkan Tempat Sampah",
      message: "PERINGATAN! Apakah Anda yakin ingin menghapus SEMUA tugas di keranjang sampah secara PERMANEN?\nTindakan ini tidak dapat dibatalkan!",
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      isDanger: true,
      onConfirm: () => executeClearAll(),
      onCancel: () => {},
    });
  };

  return {
    trashTasks,
    loading,
    processing,
    confirmModal,
    closingModals,
    toast,
    handleRestore,
    handleDeletePermanent,
    handleRestoreAll,
    handleClearAll,
    closeModal,
  };
}
