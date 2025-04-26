import { useEffect, useState, useRef } from "react"; // sumamos useRef
import { db } from "@/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import TodoThumb from "@/components/TodoThumb";
import EventThumb from "@/components/EventThumb";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date());
  const timelineRef = useRef(null);
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const [hasCentered, setHasCentered] = useState(false);

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

      setTasks(todos);
      setEvents(events);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const toggleComplete = async (task) => {
    const updated = !task.completed;
    await updateDoc(doc(db, "todos", task.id), { completed: updated });
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: updated } : t))
    );
  };

  const getDayTasks = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasks
      .filter((t) => t.date === dateStr)
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
          setHasCentered(true); // ✅ No volver a centrar
        }
      }, 100);
    }
  }, [dateRange, hasCentered, today]);

  return (
    <div className="container py-4 text-white">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Timeline horizontal */}
          <div
            className="d-flex gap-3 overflow-auto mb-5 px-2"
            style={{
              WebkitOverflowScrolling: "touch",
              cursor: "grab",
            }}
            ref={timelineRef}
            onMouseDown={(e) => {
              e.currentTarget.style.cursor = "grabbing";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.cursor = "grab";
            }}
          >
            {dateRange.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isToday = isSameDay(date, today);
              const isActive = isSameDay(date, activeDate);
              const tasksCount = getDayTasks(date).length;
              const eventsCount = getDayEvents(date).length;

              return (
                <div
                  key={dateStr}
                  className={`d-flex flex-column align-items-center px-2`}
                  style={{
                    minWidth: "100px",
                    cursor: "pointer",
                    borderTop: isToday
                      ? "3px solid var(--menta-color)"
                      : isActive
                      ? "2px solid var(--menta-color)"
                      : "1px solid rgba(255,255,255,0.2)",
                    backgroundColor:
                      isActive && !isToday ? "#1f1f1f" : "transparent",
                    padding: "10px 0",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => setActiveDate(date)}
                >
                  {/* Día y Fecha */}
                  <div
                    className={`text-uppercase ${
                      isToday ? "text-menta fw-bold" : "text-white-50"
                    }`}
                    style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}
                  >
                    {format(date, "EEE")}
                  </div>
                  <div
                    className={`fw-bold ${
                      isToday
                        ? "text-menta"
                        : isActive
                        ? "text-white"
                        : "text-white-50"
                    }`}
                    style={{ fontSize: "1.25rem" }}
                  >
                    {format(date, "d")}
                  </div>

                  {/* Tareas/Eventos como texto simple */}
                  <div
                    className="mt-2 text-center"
                    style={{ fontSize: "0.7rem" }}
                  >
                    {tasksCount > 0 && (
                      <div className="text-info">{tasksCount} tasks</div>
                    )}
                    {eventsCount > 0 && (
                      <div className="text-warning">{eventsCount} events</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tareas y eventos del día seleccionado */}
          <h4 className="mb-3">
            {isSameDay(activeDate, today)
              ? "Today"
              : format(activeDate, "EEEE, MMMM d")}
          </h4>

          <TodoThumb
            title="To-dos"
            tasks={getDayTasks(activeDate)}
            onToggle={toggleComplete}
            editable={false}
          />

          <h5 className="mt-5 mb-3">Events</h5>
          {getDayEvents(activeDate).length === 0 ? (
            <p className="text-secondary">No events for this day.</p>
          ) : (
            <EventThumb events={getDayEvents(activeDate)} />
          )}
        </>
      )}
    </div>
  );
}
