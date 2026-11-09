import React from "react";

export default function ProgressBanner({ completedTasks, totalTasks, progressPercent }) {
  return (
    <div className="progress-banner">
      <div className="progress-banner-title">Progress Penyelesaian Tugas</div>
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <div className="progress-stats">
        <span>
          {completedTasks} dari {totalTasks} tugas selesai
        </span>
        <span className="progress-percentage">{progressPercent}%</span>
      </div>
    </div>
  );
}
