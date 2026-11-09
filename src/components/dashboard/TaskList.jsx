import React from "react";
import TaskItem from "./TaskItem";

export default function TaskList({
  loading,
  filteredTasks,
  viewMode,
  groupedTasks,
  handleToggleCompleted,
  setSelectedTask,
  setShowDetailModal,
  handleDeleteTask,
}) {
  const handleOpenDetail = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  return (
    <div id="taskListContainer">
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p>Memuat tugas...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <p>Tidak ada tugas terdaftar sesuai kriteria filter.</p>
        </div>
      ) : viewMode === "list" ? (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.id_tasks}
            task={task}
            onToggleCompleted={handleToggleCompleted}
            onOpenDetail={handleOpenDetail}
            onDeleteTask={handleDeleteTask}
            showCategoryBadge={true}
          />
        ))
      ) : (
        Object.entries(groupedTasks).map(([category, categoryTasks]) => (
          <div
            key={category}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "10px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                {category}
              </h3>

              <span
                style={{
                  background: "#e0e7ff",
                  color: "#4338ca",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {categoryTasks.length} tugas
              </span>
            </div>

            {categoryTasks.map((task) => (
              <TaskItem
                key={task.id_tasks}
                task={task}
                onToggleCompleted={handleToggleCompleted}
                onOpenDetail={handleOpenDetail}
                onDeleteTask={handleDeleteTask}
                showCategoryBadge={false}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
