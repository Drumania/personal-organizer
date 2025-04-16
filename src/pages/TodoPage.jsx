import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays } from "date-fns";

export default function TodoPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    const q = query(collection(db, "todos"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(data);
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title) return;

    await addDoc(collection(db, "todos"), {
      userId: user.uid,
      title,
      priority,
      completed: false,
      date,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setPriority("normal");
    setDate(format(new Date(), "yyyy-MM-dd"));
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    await updateDoc(doc(db, "todos", task.id), {
      completed: !task.completed,
    });
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, "todos", taskId));
    fetchTasks();
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const groupTasks = (targetDate) => {
    const filtered = tasks
      .filter((t) => t.date === targetDate)
      .sort((a, b) => {
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (a.priority !== "high" && b.priority === "high") return 1;
        return 0;
      });
    return filtered;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="container py-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>To-dos</h2>
        <button className="btn btn-menta" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg"></i> Add Task
        </button>
      </div>

      {/* Lista de tareas por día */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          <DaySection
            title="Today"
            tasks={groupTasks(today)}
            onToggle={toggleComplete}
            onDelete={handleDelete}
          />
          <DaySection
            title="Tomorrow"
            tasks={groupTasks(tomorrow)}
            onToggle={toggleComplete}
            onDelete={handleDelete}
          />
        </>
      )}

      {showModal && (
        <div
          className="custom-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-white p-3 rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">New Task</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form
                onSubmit={(e) => {
                  handleAdd(e);
                  setShowModal(false);
                }}
              >
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <select
                    className="form-select bg-dark text-white"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="normal">Normal priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>

                <div className="mb-3">
                  <input
                    type="date"
                    className="form-control bg-dark text-white"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <button className="btn btn-menta w-100" type="submit">
                  Add Task
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DaySection({ title, tasks, onToggle, onDelete }) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-5">
      <h5 className="mb-3">{title}</h5>
      <ul className="list-group">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`list-group-item d-flex justify-content-between align-items-center bg-dark text-white ${
              task.completed ? "text-decoration-line-through opacity-50" : ""
            }`}
          >
            <span>
              {task.title}{" "}
              {task.priority === "high" && (
                <span className="badge bg-danger ms-2">High</span>
              )}
            </span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-success"
                onClick={() => onToggle(task)}
              >
                {task.completed ? "Undo" : "Done"}
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDelete(task.id)}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
