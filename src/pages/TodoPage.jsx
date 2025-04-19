import { useEffect, useState, useRef } from "react";
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
  const [editingId, setEditingId] = useState(null);
  const [isToday, setIsToday] = useState(true);
  const titleRef = useRef(null);

  const fetchTasks = async () => {
    setLoading(true);
    const q = query(collection(db, "todos"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(data);
    setLoading(false);
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (!title) return;

    const payload = {
      userId: user.uid,
      title,
      priority,
      completed: false,
      date,
      createdAt: serverTimestamp(),
    };

    if (editingId) {
      await updateDoc(doc(db, "todos", editingId), payload);
    } else {
      await addDoc(collection(db, "todos"), payload);
    }

    setTitle("");
    setPriority("normal");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setEditingId(null);
    setIsToday(true);
    setShowModal(false);
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

  const handleEdit = (task) => {
    setTitle(task.title);
    setPriority(task.priority || "normal");
    setDate(task.date);
    setEditingId(task.id);
    setIsToday(task.date === format(new Date(), "yyyy-MM-dd"));
    setShowModal(true);
  };

  const handleSkipToTomorrow = async () => {
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
    await updateDoc(doc(db, "todos", editingId), { date: tomorrow });
    setShowModal(false);
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

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          <TodoThumb
            title="Today"
            tasks={groupTasks(today)}
            onToggle={toggleComplete}
            onDelete={handleDelete}
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
                <h5 className="m-0">{editingId ? "Edit Task" : "New Task"}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAddOrUpdate}>
                <div className="mb-2">
                  <textarea
                    ref={titleRef}
                    className="form-control"
                    placeholder="Task title"
                    rows="2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Fecha condicional */}
                <div className="mb-2 form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isToday}
                    onChange={() => {
                      const checked = !isToday;
                      setIsToday(checked);
                      if (checked) {
                        setDate(format(new Date(), "yyyy-MM-dd"));
                      }
                    }}
                    id="todayCheck"
                  />
                  <label className="form-check-label" htmlFor="todayCheck">
                    Today
                  </label>
                </div>

                {!isToday && (
                  <div className="mb-2">
                    <input
                      type="date"
                      className="form-control bg-dark text-white"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                )}

                {/* Prioridad */}
                <div className="mb-3 d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="normal"
                      name="priority"
                      value="normal"
                      checked={priority === "normal"}
                      onChange={(e) => setPriority(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="normal">
                      Normal
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="high"
                      name="priority"
                      value="high"
                      checked={priority === "high"}
                      onChange={(e) => setPriority(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="high">
                      High
                    </label>
                  </div>
                </div>

                {editingId && (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-warning w-100 mb-2"
                      onClick={handleSkipToTomorrow}
                    >
                      ⏭ Skip to Tomorrow
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger w-100 mb-3"
                      onClick={() => {
                        handleDelete(editingId);
                        setShowModal(false);
                      }}
                    >
                      🗑 Delete Task
                    </button>
                  </>
                )}

                <button type="submit" className="btn btn-menta w-100">
                  Save Task
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
