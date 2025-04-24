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
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, isSameWeek, isSameMonth } from "date-fns";
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
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const fetchTasks = async () => {
    setLoading(true);

    const q = query(collection(db, "todos"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTasks(data);

    const uniqueCategories = Array.from(
      new Set(data.map((t) => t.category).filter(Boolean))
    );
    setCategories(uniqueCategories); // Nuevo estado

    // // Luego de cargar tareas, asegurate que las de rutina estén creadas
    // await handleRoutineTasks(data);

    setLoading(false);
  };

  const handleRoutineTasks = async (currentTasks) => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;

    const routines = snap.data().myRoutines || [];
    const todayDate = new Date();

    let created = false; // Solo refetch si se crea una nueva

    for (const routine of routines) {
      const alreadyExists = currentTasks.some(
        (t) =>
          t.title === routine.name &&
          t.type === "routine" &&
          t.date === today &&
          !t.completed
      );

      if (routine.paused || alreadyExists) continue;

      let shouldCreate = false;

      if (routine.frequency === "Daily") {
        shouldCreate = true;
      } else if (
        routine.frequency === "Weekly" &&
        !currentTasks.some(
          (t) =>
            t.title === routine.name &&
            t.type === "routine" &&
            isSameWeek(new Date(t.date), todayDate)
        )
      ) {
        shouldCreate = true;
      } else if (
        routine.frequency === "Monthly" &&
        !currentTasks.some(
          (t) =>
            t.title === routine.name &&
            t.type === "routine" &&
            isSameMonth(new Date(t.date), todayDate)
        )
      ) {
        shouldCreate = true;
      }

      if (shouldCreate) {
        const newTask = {
          userId: user.uid,
          title: routine.name,
          priority: "normal",
          completed: false,
          date: today,
          type: "routine",
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, "todos"), newTask);
        created = true;
      }
    }

    // Refetch solo si se creó algo
    if (created) {
      const q = query(collection(db, "todos"), where("userId", "==", user.uid));
      const refetch = await getDocs(q);
      const updated = refetch.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(updated);
    }
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
      category: category || null,
    };

    if (editingId) {
      await updateDoc(doc(db, "todos", editingId), payload);
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
      );
    } else {
      const docRef = await addDoc(collection(db, "todos"), payload);
      setTasks((prevTasks) => [
        ...prevTasks,
        { ...payload, id: docRef.id, completed: false },
      ]);
    }

    setTitle("");
    setPriority("normal");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setEditingId(null);
    setIsToday(true);
    setShowModal(false);
  };

  const toggleComplete = async (task) => {
    const updated = !task.completed;
    await updateDoc(doc(db, "todos", task.id), { completed: updated });

    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, completed: updated } : t
      )
    );
  };

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, "todos", taskId));
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
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

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === editingId ? { ...t, date: tomorrow } : t))
    );

    setShowModal(false);
  };

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
        <div className="loader-menta"></div>
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
      {/* Modal de tareas */}
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

                <label className="form-label">Select Category</label>
                <select
                  className="form-select bg-dark text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <details className="mt-2">
                  <summary className="opacity-50 mb-2">
                    Add new category
                  </summary>
                  <input
                    type="text"
                    className="form-control mt-2 bg-dark text-white"
                    placeholder="New category"
                    value={
                      category && !categories.includes(category) ? category : ""
                    }
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </details>

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
                  <div className="mb-3 d-flex justify-content-between gap-3 border-top pt-3 mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={handleSkipToTomorrow}
                    >
                      Skip to Tomorrow
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-danger px-4"
                      onClick={() => {
                        handleDelete(editingId);
                        setShowModal(false);
                      }}
                    >
                      Delete Task
                    </button>
                  </div>
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
