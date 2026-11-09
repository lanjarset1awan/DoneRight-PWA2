import React from "react";

export default function ProfileAvatar({
  avatarPreview,
  username,
  user,
  isEditing,
  triggerFileSelect,
  fileInputRef,
  handleAvatarChange,
  handleRemoveAvatar,
  getInitials,
}) {
  return (
    <div className="profile-avatar-container">
      <div className="profile-avatar-wrapper">
        {avatarPreview ? (
          <img src={avatarPreview} alt="Foto Profil" className="profile-avatar" />
        ) : (
          <div className="profile-avatar-placeholder">
            {getInitials(username || user?.username)}
          </div>
        )}

        {/* CAMERA OVERLAY (only in edit mode) */}
        {isEditing && (
          <div className="profile-camera-btn" onClick={triggerFileSelect} title="Ganti Foto Profil">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>
      
      {/* REMOVE AVATAR BUTTON (only in edit mode if avatar exists) */}
      {isEditing && avatarPreview && (
        <button
          type="button"
          className="profile-remove-avatar-btn"
          onClick={handleRemoveAvatar}
          title="Hapus Foto Profil"
        >
          Hapus Foto Profil
        </button>
      )}
      
      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleAvatarChange}
      />
    </div>
  );
}
