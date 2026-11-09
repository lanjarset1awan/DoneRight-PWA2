import { useState, useRef, useEffect } from "react";
import userService from "../services/userService";

export default function useProfileData(token, user, onUserUpdate, onLogout, onClose) {
  // Navigation states
  const [isEditing, setIsEditing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Profile data from userService
  const currentProfile = userService.getUserProfile();

  // Form states
  const [username, setUsername] = useState(user?.nama || user?.username || currentProfile.nama || "Lanjar Setiawan");
  const [nim, setNim] = useState(user?.nim || currentProfile.nim || "21120124120023");
  const [kelompok, setKelompok] = useState(user?.kelompok || currentProfile.kelompok || "Kelompok 16");
  const [prodi, setProdi] = useState(user?.prodi || currentProfile.prodi || "Teknik Komputer");
  const [email, setEmail] = useState(user?.email || currentProfile.email || "lanjarsetiawan3@gmail.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Avatar states
  const [avatarData, setAvatarData] = useState(user?.avatar || currentProfile.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || currentProfile.avatar || "");

  // Visibility states
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const prof = userService.getUserProfile();
    setUsername(user?.nama || user?.username || prof.nama);
    setNim(user?.nim || prof.nim);
    setKelompok(user?.kelompok || prof.kelompok);
    setProdi(user?.prodi || prof.prodi);
    setEmail(user?.email || prof.email);
    setAvatarPreview(user?.avatar || prof.avatar);
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleClose = () => {
    if (onClose) {
      setIsClosing(true);
      setTimeout(() => {
        setIsClosing(false);
        onClose();
      }, 300);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Ukuran file gambar tidak boleh melebihi 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setAvatarData(reader.result);
        userService.updateAvatar(reader.result);
        setErrorMsg("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview("");
    setAvatarData("");
    userService.updateAvatar("");
    setErrorMsg("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      setErrorMsg("Nama lengkap dan email wajib diisi!");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setErrorMsg("Password baru harus minimal 8 karakter!");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("Konfirmasi password baru tidak cocok.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg("");

    const updatedProfile = {
      username: username.trim(),
      nama: username.trim(),
      nim: nim.trim(),
      kelompok: kelompok.trim(),
      prodi: prodi.trim(),
      email: email.trim(),
      avatar: avatarData || avatarPreview,
    };

    try {
      const result = await userService.updateProfileRemote(updatedProfile);
      if (result.success) {
        if (onUserUpdate) onUserUpdate(result.data, newPassword);
        showToast("Profil berhasil diperbarui!", "success");
        setIsEditing(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(result.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await userService.deleteAccount(user?.id_users);
      if (res && res.success) {
        setShowDeleteConfirm(false);
        showToast("Akun berhasil dihapus.", "success");
        if (onClose) onClose();
        if (onLogout) onLogout();
      } else {
        throw new Error(res?.message || "Gagal menghapus akun.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan saat menghapus akun.");
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMsg("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const getInitials = (name) => {
    if (!name) return "MP";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return {
    isEditing,
    setIsEditing,
    isClosing,
    handleClose,
    username,
    setUsername,
    nim,
    setNim,
    kelompok,
    setKelompok,
    prodi,
    setProdi,
    email,
    setEmail,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    avatarPreview,
    currentPasswordVisible,
    setCurrentPasswordVisible,
    newPasswordVisible,
    setNewPasswordVisible,
    confirmPasswordVisible,
    setConfirmPasswordVisible,
    loading,
    errorMsg,
    toast,
    showDeleteConfirm,
    setShowDeleteConfirm,
    fileInputRef,
    handleAvatarChange,
    triggerFileSelect,
    handleRemoveAvatar,
    handleSubmit,
    handleDeleteAccount,
    handleCancelEdit,
    getInitials,
    plaintextPassword: user?.plaintextPassword || "",
  };
}
