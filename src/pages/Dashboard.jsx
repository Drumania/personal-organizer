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
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import TodoThumb from "@/components/TodoThumb";
import EventThumb from "@/components/EventThumb";
import DateTimeline from "@/components/DateTimeline";
import CalendarPage from "@/pages/CalendarPage";
import ShoppingList from "@/pages/ShoppingList";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date());
  const [hasCentered, setHasCentered] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [location, setLocation] = useState(null);
  const timelineRef = useRef(null);
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [date, setDate] = useState(todayStr);
  const [editingId, setEditingId] = useState(null);
  const [isToday, setIsToday] = useState(true);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const titleRef = useRef(null);

  const dateRange = Array.from({ length: 11 }, (_, i) =>
    addDays(subDays(today, 5), i)
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const qTodos = query(
        collection(db, "todos"),
        where("userId", "==", user.uid)
      );
      const snapTodos = await getDocs(qTodos);
      const todos = snapTodos.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const qEvents = query(
        collection(db, "events"),
        where("userId", "==", user.uid)
      );
      const snapEvents = await getDocs(qEvents);
      const events = snapEvents.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const uniqueCategories = Array.from(
        new Set(todos.map((t) => t.category).filter(Boolean))
      );

      setTasks(todos);
      setEvents(events);
      setCategories(uniqueCategories);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
        },
        (err) => {
          console.error("Error getting location:", err);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;

      const apiKey = import.meta.env.VITE_API_WHEATER;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;
      const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;

      const [forecastRes, currentRes] = await Promise.all([
        fetch(forecastUrl),
        fetch(currentUrl),
      ]);

      const forecastData = await forecastRes.json();
      const currentData = await currentRes.json();

      const groupedWeather = {};
      forecastData.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!groupedWeather[date]) {
          groupedWeather[date] = item;
        }
      });

      groupedWeather[todayStr] = {
        main: currentData.main,
        weather: currentData.weather,
      };

      setWeatherData(groupedWeather);
    };

    fetchWeather();
  }, [location]);

  const toggleComplete = async (task) => {
    const updated = !task.completed;
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const isOverdue = !task.completed && updated && task.date < todayStr;

    const updatePayload = {
      completed: updated,
      ...(isOverdue && { date: todayStr }),
    };

    await updateDoc(doc(db, "todos", task.id), updatePayload);

    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, ...updatePayload } : t))
    );
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
      setTasks((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t))
      );
    } else {
      const docRef = await addDoc(collection(db, "todos"), payload);
      setTasks((prev) => [...prev, { ...payload, id: docRef.id }]);
    }

    resetModal();
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setPriority(task.priority || "normal");
    setDate(task.date);
    setCategory(task.category || "");
    setEditingId(task.id);
    setIsToday(task.date === todayStr);
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, "todos", taskId));
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    resetModal();
  };

  const handleSkipToTomorrow = async () => {
    const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");
    await updateDoc(doc(db, "todos", editingId), { date: tomorrowStr });
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, date: tomorrowStr } : t))
    );
    resetModal();
  };

  const resetModal = () => {
    setTitle("");
    setPriority("normal");
    setDate(todayStr);
    setEditingId(null);
    setIsToday(true);
    setShowModal(false);
    setCategory("");
  };

  const getDayTasks = (date) => {
    return tasks
      .filter((t) => {
        const taskDate = parseISO(t.date);
        if (isSameDay(taskDate, date)) return true;
        if (isSameDay(date, today) && isBefore(taskDate, today) && !t.completed)
          return true;
        return false;
      })
      .map((t) => {
        const taskDate = parseISO(t.date);
        if (
          isSameDay(date, today) &&
          isBefore(taskDate, today) &&
          !t.completed
        ) {
          const daysOverdue = Math.floor(
            (today - taskDate) / (1000 * 60 * 60 * 24)
          );
          return { ...t, daysOverdue };
        }
        return { ...t };
      })
      .sort((a, b) => {
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (a.priority !== "high" && b.priority === "high") return 1;
        return 0;
      });
  };

  const getDayEvents = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  };

  const futureTasks = tasks
    .filter((t) => isAfter(new Date(t.date), today))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  useEffect(() => {
    if (timelineRef.current && !hasCentered) {
      const timeline = timelineRef.current;
      const todayIndex = dateRange.findIndex((d) => isSameDay(d, today));

      setTimeout(() => {
        const todayElement = timeline.children[todayIndex];
        if (todayElement) {
          const scrollTo =
            todayElement.offsetLeft -
            timeline.clientWidth / 2 +
            todayElement.clientWidth / 2;
          timeline.scrollTo({ left: scrollTo, behavior: "smooth" });
          setHasCentered(true);
        }
      }, 100);
    }
  }, [dateRange, hasCentered, today]);

  return (
    <div className="container py-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">
          {isSameDay(activeDate, today)
            ? "Today"
            : format(activeDate, "EEEE, MMMM d")}
        </h2>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="row">
            <div className="col-8">
              <DateTimeline
                dateRange={dateRange}
                today={today}
                activeDate={activeDate}
                setActiveDate={setActiveDate}
                getDayTasks={getDayTasks}
                getDayEvents={getDayEvents}
                timelineRef={timelineRef}
                weatherData={weatherData}
              />

              <TodoThumb
                title="To-dos"
                tasks={getDayTasks(activeDate)}
                onToggle={toggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
                setShowModal={setShowModal}
                editable={true}
              />

              {getDayEvents(activeDate).length > 0 && (
                <>
                  <h5 className="mt-5 mb-3">Events</h5>
                  <EventThumb events={getDayEvents(activeDate)} />
                </>
              )}

              {futureTasks.length > 0 && (
                <details className="mt-5">
                  <summary className="text-white mb-3">Upcoming Tasks</summary>
                  {futureTasks.map((task) => (
                    <TodoThumb
                      key={task.id}
                      title={format(new Date(task.date), "PPP")}
                      tasks={[task]}
                      onToggle={toggleComplete}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      editable={true}
                    />
                  ))}
                </details>
              )}
            </div>

            <div className="col-4">
              <CalendarPage />
              <ShoppingList />
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div className="custom-modal-backdrop" onClick={resetModal}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-dark text-white p-3 rounded-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">{editingId ? "Edit Task" : "New Task"}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={resetModal}
                ></button>
              </div>

              <form onSubmit={handleAddOrUpdate}>
                <textarea
                  ref={titleRef}
                  className="form-control mb-2"
                  placeholder="Task title"
                  rows="2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <label className="form-label">Select Category</label>
                <select
                  className="form-select bg-dark text-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
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

                <div className="mb-2 form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isToday}
                    onChange={() => {
                      const checked = !isToday;
                      setIsToday(checked);
                      if (checked) setDate(todayStr);
                    }}
                    id="todayCheck"
                  />
                  <label className="form-check-label" htmlFor="todayCheck">
                    Today
                  </label>
                </div>

                {!isToday && (
                  <input
                    type="date"
                    className="form-control bg-dark text-white mb-2"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                )}

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
                      onClick={() => handleDelete(editingId)}
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
