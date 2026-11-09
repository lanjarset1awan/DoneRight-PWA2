import React from "react";

export default function TrashList({
  loading,
  trashTasks,
  processing,
  handleRestore,
  handleDeletePermanent,
}) {
  return (
    <div className="board-card trash-board-card">
      <div className="board-header trash-board-header">
        <div className="board-title trash-board-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Keranjang Sampah ({trashTasks.length})
        </div>
      </div>

      <div>
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2}></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p>Memuat keranjang sampah...</p>
          </div>
        ) : trashTasks.length === 0 ? (
          <div className="empty-state trash-empty-state">
            <div className="empty-state-icon trash-empty-icon">
              🗑️
            </div>
            <h3 className="trash-empty-title">
              Keranjang Sampah Kosong
            </h3>
            <p className="trash-empty-subtitle">
              Tugas yang Anda hapus sementara akan tampil di sini untuk dipulihkan kembali.
            </p>
          </div>
        ) : (
          <div className="trash-list-container">
            {trashTasks.map((task) => {
              const deadlineStr = task.deadline && (typeof task.deadline === 'string' ? task.deadline.replace(' ', 'T') : task.deadline);
              const deadline = deadlineStr ? new Date(deadlineStr) : null;
              return (
                <div className="task-item trash-task-item" key={task.id_tasks}>
                  <div className="task-left">
                    <h3 className="task-title trash-task-title">
                      {task.title}
                    </h3>
                    {task.description && <p className="task-desc">{task.description}</p>}

                    <div className="task-badges">
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      {task.category_name && (
                        <span className="badge badge-category">
                          {task.category_name.charAt(0).toUpperCase() + task.category_name.slice(1)}
                        </span>
                      )}
                      {deadline && (
                        <span className="badge badge-deadline">
                          Deadline: {deadline.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}{" "}
                          {deadline.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-right trash-task-right">
                    <button
                      onClick={() => handleRestore(task.id_tasks)}
                      disabled={processing}
                      className="trash-btn-restore-single"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                      Pulihkan
                    </button>
                    <button
                      onClick={() => handleDeletePermanent(task.id_tasks)}
                      disabled={processing}
                      className="trash-btn-delete-permanent"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus Permanen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
