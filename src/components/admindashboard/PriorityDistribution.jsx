import React from "react";

export default function PriorityDistribution({
  highCount,
  highPercent,
  mediumCount,
  mediumPercent,
  lowCount,
  lowPercent,
}) {
  return (
    <div className="board-card">
      <div className="board-title">Distribusi Prioritas</div>
      <div className="priority-dist-row">
        <div className="priority-progress-item">
          <div className="priority-progress-header">
            <span>High Priority</span>
            <span>{highCount} tugas</span>
          </div>
          <div className="priority-progress-bar">
            <div className="priority-progress-fill fill-red" style={{ width: `${highPercent}%` }}></div>
          </div>
        </div>

        <div className="priority-progress-item">
          <div className="priority-progress-header">
            <span>Medium Priority</span>
            <span>{mediumCount} tugas</span>
          </div>
          <div className="priority-progress-bar">
            <div className="priority-progress-fill fill-yellow" style={{ width: `${mediumPercent}%` }}></div>
          </div>
        </div>

        <div className="priority-progress-item">
          <div className="priority-progress-header">
            <span>Low Priority</span>
            <span>{lowCount} tugas</span>
          </div>
          <div className="priority-progress-bar">
            <div className="priority-progress-fill fill-green" style={{ width: `${lowPercent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
