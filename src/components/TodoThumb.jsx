export default function TodoThumb({
  title,
  tasks = [],
  onToggle,
  onDelete,
  onEdit,
}) {
  if (!tasks.length) return null;

  return (
    <div className="mb-5">
      <h5 className="mb-3">
        {title}{" "}
        <small className="text-secondary">
          {tasks.filter((t) => t.completed).length}/{tasks.length}
        </small>
      </h5>

      <ul className="list-group">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`list-group-item d-flex justify-content-between align-items-center bg-dark text-white ${
              task.completed ? "opacity-50" : ""
            }`}
          >
            <div className="d-flex align-items-center gap-3">
              <input
                type="checkbox"
                className="custom-check"
                checked={task.completed}
                onChange={() => onToggle(task)}
              />
              <div>
                {task.title}
                {task.category && (
                  <span className="badge bg-secondary ms-2">
                    {task.category}
                  </span>
                )}
              </div>
              {task.daysOverdue && (
                <span className="text-danger ms-2">+{task.daysOverdue}</span>
              )}
              {task.type === "routine" && (
                <span className="badge bg-success ms-2">Routine</span>
              )}
              {task.priority === "high" && (
                <span className="badge bg-danger ms-2">High</span>
              )}
            </div>

            {onEdit && (
              <button
                className="btn btn-sm text-white"
                onClick={() => onEdit(task)}
                title="Edit"
              >
                <i className="bi bi-gear"></i>
              </button>
            )}
          </li>
        ))}
      </ul>
      {tasks.length > 0 && tasks.every((t) => t.completed) && (
        <div className="alert alert-success mt-3 animate-success">
          ✅ You’ve completed all tasks for the day!
        </div>
      )}
    </div>
  );
}
