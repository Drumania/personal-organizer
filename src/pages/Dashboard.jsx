// Nuevo Dashboard.jsx con layout mejorado estilo wireframe y componentes estilizados
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
import DialogAddTask from "@/components/Dashboard/DialogAddTask";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date());
  const [weatherData, setWeatherData] = useState({});
  const [location, setLocation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("normal");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [editingId, setEditingId] = useState(null);
  const [isToday, setIsToday] = useState(true);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const today = new Date();
  const timelineRef = useRef(null);
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
        (err) => console.error("Error getting location:", err)
      );
    }
  }, []);

  const getDayTasks = (date) => {
    return tasks
      .filter((t) => {
        const taskDate = parseISO(t.date);
        return (
          isSameDay(taskDate, date) ||
          (isSameDay(date, today) && isBefore(taskDate, today) && !t.completed)
        );
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

  return (
    <div className="container-fluid py-4 text-white">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="mb-3">
            <h2>
              {isSameDay(activeDate, today)
                ? "Today"
                : format(activeDate, "EEEE, MMMM d")}
            </h2>
          </div>

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
            onToggle={(task) => {
              const updated = !task.completed;
              const todayStr = format(new Date(), "yyyy-MM-dd");
              const isOverdue =
                !task.completed && updated && task.date < todayStr;
              const updatePayload = {
                completed: updated,
                ...(isOverdue && { date: todayStr }),
              };
              updateDoc(doc(db, "todos", task.id), updatePayload);
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === task.id ? { ...t, ...updatePayload } : t
                )
              );
            }}
            onEdit={(task) => {
              setTitle(task.title);
              setPriority(task.priority || "normal");
              setDate(task.date);
              setCategory(task.category || "");
              setEditingId(task.id);
              setIsToday(task.date === format(today, "yyyy-MM-dd"));
              setShowModal(true);
            }}
            onDelete={(taskId) => {
              deleteDoc(doc(db, "todos", taskId));
              setTasks((prev) => prev.filter((t) => t.id !== taskId));
            }}
            setShowModal={setShowModal}
          />

          {getDayEvents(activeDate).length > 0 && (
            <>
              <h5 className="mt-4 mb-3">Events</h5>
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
                  onToggle={() => toggleComplete(task)}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  editable={true}
                />
              ))}
            </details>
          )}
        </div>

        <div className="col-lg-4 d-flex flex-column gap-4">
          <CalendarPage />
          <ShoppingList />
        </div>

        <DialogAddTask
          visible={showModal}
          setVisible={setShowModal}
          userId={user.uid}
          setTasks={setTasks}
          editingId={editingId}
          title={title}
          setTitle={setTitle}
          priority={priority}
          setPriority={setPriority}
          date={date}
          setDate={setDate}
          category={category}
          setCategory={setCategory}
        />
      </div>
    </div>
  );
}
