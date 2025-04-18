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
import TodoThumb from "@/components/TodoThumb";

export default function TodoPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // para detectar modo edición

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

  const handleEdit = (task) => {
    setTitle(task.title);
    setPriority(task.priority);
    setDate(task.date);
    setEditingId(task.id);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, "todos", taskId));
    fetchTasks();
  };

  const toggleComplete = async (task) => {
    try {
      await updateDoc(doc(db, "todos", task.id), {
        completed: !task.completed,
      });

      // actualizar localmente sin recargar todo
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
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

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          <TodoThumb
            title="Today"
            tasks={groupTasks(today)}
            onToggle={toggleComplete}
            onDelete={handleDelete} // este se usa en el modal ahora
            onEdit={handleEdit}
          />
          <TodoThumb
            title="Tomorrow"
            tasks={groupTasks(tomorrow)}
            onToggle={toggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit}
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
                {/* Título */}
                <div className="mb-2">
                  <textarea
                    className="form-control bg-dark text-white"
                    placeholder="Task title"
                    rows="3"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Checkbox Today */}
                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="todayCheck"
                    checked={date === format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDate(format(new Date(), "yyyy-MM-dd"));
                      } else {
                        setDate(""); // lo dejamos vacío para forzar al user a elegir
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor="todayCheck">
                    Today
                  </label>
                </div>

                {/* Date picker si NO es hoy */}
                {date !== format(new Date(), "yyyy-MM-dd") && (
                  <div className="mb-3">
                    <input
                      type="date"
                      className="form-control bg-dark text-white"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Prioridad */}
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <div className="btn-group w-100" role="group">
                    {["normal", "high"].map((level) => (
                      <input
                        key={level}
                        type="button"
                        className={`btn ${
                          priority === level ? "btn-menta" : "btn-outline-light"
                        }`}
                        value={level.charAt(0).toUpperCase() + level.slice(1)}
                        onClick={() => setPriority(level)}
                      />
                    ))}
                  </div>
                </div>

                {/* Eliminar (solo si está en modo edición) */}
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100 my-3"
                    onClick={() => {
                      handleDelete(editingId);
                      setShowModal(false);
                    }}
                  >
                    Delete Task
                  </button>
                )}

                <button className="btn btn-menta w-100" type="submit">
                  {editingId ? "Save Changes" : "Add Task"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
