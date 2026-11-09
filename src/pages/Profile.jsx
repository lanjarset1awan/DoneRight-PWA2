import useProfileData from "../hooks/useProfileData";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import ProfileView from "../components/profile/ProfileView";
import ProfileForm from "../components/profile/ProfileForm";
import ConfirmModal from "../components/ConfirmModal";
import Navbar from "../components/Navbar";
import NavigationTabs from "../components/NavigationTabs";
import "../styles/pages/profile.css";

export default function Profile({
  token,
  user,
  onUserUpdate,
  onLogout,
  onClose,
  isPageMode = false,
  onNavigateDashboard,
  onNavigateReport,
  onNavigateTrash,
}) {
  const {
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
    plaintextPassword,
  } = useProfileData(token, user, onUserUpdate, onLogout, onClose);

  const profileContent = (
    <div className="profile-container">
      {/* ALERTS */}
      {errorMsg && (
        <div className="profile-error-alert">
          <span>⚠ {errorMsg}</span>
        </div>
      )}

      {/* MAIN PROFILE CARD */}
      <div className="profile-card">
        {onClose && (
          <button className="profile-close-btn" onClick={handleClose} aria-label="Close Profile">
            &times;
          </button>
        )}

        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#0f172a", fontSize: "24px", fontWeight: "700" }}>
          {isEditing ? "Edit Profil" : "Profil"}
        </h2>

        {/* AVATAR SECTION */}
        <ProfileAvatar
          avatarPreview={avatarPreview}
          username={username}
          user={user}
          isEditing={isEditing}
          triggerFileSelect={triggerFileSelect}
          fileInputRef={fileInputRef}
          handleAvatarChange={handleAvatarChange}
          handleRemoveAvatar={handleRemoveAvatar}
          getInitials={getInitials}
        />

        {/* VIEW / EDIT FORM PANEL */}
        {!isEditing ? (
          <ProfileView
            user={{ ...user, nama: username, nim, kelompok, prodi, email, avatar: avatarPreview }}
            setIsEditing={setIsEditing}
            currentPasswordVisible={currentPasswordVisible}
            setCurrentPasswordVisible={setCurrentPasswordVisible}
            plaintextPassword={plaintextPassword}
            setShowDeleteConfirm={setShowDeleteConfirm}
          />
        ) : (
          <ProfileForm
            handleSubmit={handleSubmit}
            username={username}
            setUsername={setUsername}
            nim={nim}
            setNim={setNim}
            kelompok={kelompok}
            setKelompok={setKelompok}
            prodi={prodi}
            setProdi={setProdi}
            email={email}
            setEmail={setEmail}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            newPasswordVisible={newPasswordVisible}
            setNewPasswordVisible={setNewPasswordVisible}
            confirmPasswordVisible={confirmPasswordVisible}
            setConfirmPasswordVisible={setConfirmPasswordVisible}
            loading={loading}
            handleCancelEdit={handleCancelEdit}
          />
        )}
      </div>

      {/* CONFIRMATION MODAL FOR RESET */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="Reset Profil ke Default"
        message="Apakah Anda yakin ingin mengembalikan profil mahasiswa ke data default praktikum?"
        confirmText={loading ? "Mereset..." : "Ya, Reset"}
        cancelText="Batal"
        isDanger={true}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        closingModal=""
        closeModal={() => setShowDeleteConfirm(false)}
      />

      {/* TOAST NOTIFICATION */}
      <div className={`toast-notification ${toast.show ? "active" : ""} ${toast.type}`}>
        <div className="toast-message">{toast.message}</div>
      </div>
    </div>
  );

  return (
    <div
      className={`profile-body ${isClosing ? "closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      {profileContent}
    </div>
  );
}
