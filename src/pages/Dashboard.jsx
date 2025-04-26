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
import DateTimeline from "@/components/DateTimeline";

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
  const [weatherData, setWeatherData] = useState({});
  const [location, setLocation] = useState(null);

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

  useEffect(() => {
    // Obtener ubicación del usuario
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

      const apiKey = "a9e26448aaa9042e8ea7b0075c32523b";
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`;

      const res = await fetch(url);
      const data = await res.json();

      // Procesamos para tener clima por día
      const groupedWeather = {};
      data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];
        if (!groupedWeather[date]) {
          groupedWeather[date] = item;
        }
      });

      setWeatherData(groupedWeather);
    };

    fetchWeather();
  }, [location]);

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
          setHasCentered(true);
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
