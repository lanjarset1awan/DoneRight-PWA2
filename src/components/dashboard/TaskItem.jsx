import React from "react";

export default function TaskItem({
  task,
  onToggleCompleted,
  onOpenDetail,
  onDeleteTask,
  showCategoryBadge = true
}) {
  const deadlineStr = task.deadline && (typeof task.deadline === 'string' ? task.deadline.replace(' ', 'T') : task.deadline);
  const deadline = deadlineStr ? new Date(deadlineStr) : null;
  const validDeadline = deadline && !isNaN(deadline.getTime());
  const completedAt = task.completed_at ? new Date(task.completed_at) : null;
  const validCompletedAt = completedAt && !isNaN(completedAt.getTime());
  const now = new Date();
  const isOverdue = validDeadline && (
    (!task.is_completed && deadline < now) ||
    (task.is_completed && validCompletedAt && completedAt > deadline)
  );

  const priorityText = (task.priority || "medium").toLowerCase();

  return (
    <div className="task-item">
      <div className="task-left">
        <div className="task-title-row">
          <div
            className={`todo-checkbox ${task.is_completed ? "checked" : ""}`}
            onClick={() => onToggleCompleted(task.id_tasks)}
          ></div>

          <h3 className={`task-title ${task.is_completed ? "completed" : ""}`}>
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}

        <div className="task-badges">
          <span className={`badge badge-${priorityText}`}>
            {priorityText.toUpperCase()}
          </span>

          {showCategoryBadge && task.category_name && (
            <span className="badge badge-category">
              {task.category_name}
            </span>
          )}

          {validDeadline && (
            <span className="badge badge-deadline">
              Deadline: {deadline.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}

          {task.is_completed && (
            <span className="badge badge-completed">
              ✓ Selesai
            </span>
          )}

          {isOverdue && (
            <span className="badge badge-overdue">
              ⚠ Overdue
            </span>
          )}
        </div>
      </div>

      <div className="task-right">
        <button
          type="button"
          className="btn-detail"
          onClick={() => onOpenDetail(task)}
        >
          Detail
        </button>
        {onDeleteTask && (
          <button
            type="button"
            className="btn-hapus"
            onClick={() => onDeleteTask(task.id_tasks)}
            title="Hapus tugas"
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
