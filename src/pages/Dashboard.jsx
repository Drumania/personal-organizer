import { useEffect, useState } from "react";
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
import { format, addDays, isBefore, parseISO } from "date-fns";
import TodoThumb from "@/components/TodoThumb";
import EventThumb from "@/components/EventThumb";

export default function Dashboard() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState({ today: [], tomorrow: [] });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");

  // Migrar tareas incompletas de días anteriores
  const migrateOldTasksToToday = async (uid) => {
    const q = query(
      collection(db, "todos"),
      where("userId", "==", uid),
      where("completed", "==", false)
    );
    const snap = await getDocs(q);

    const batchUpdates = snap.docs.filter((docSnap) => {
      const data = docSnap.data();
      return isBefore(parseISO(data.date), new Date());
    });

    await Promise.all(
      batchUpdates.map((docSnap) =>
        updateDoc(doc(db, "todos", docSnap.id), { date: todayStr })
      )
    );
  };

  // Fetch de tareas y eventos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      await migrateOldTasksToToday(user.uid);

      const todosRef = collection(db, "todos");
      const q1 = query(todosRef, where("userId", "==", user.uid));
      const snap1 = await getDocs(q1);
      const allTasks = snap1.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const today = allTasks.filter((t) => t.date === todayStr);
      const tomorrow = allTasks.filter((t) => t.date === tomorrowStr);
      setTodayTasks({ today, tomorrow });

      const eventsRef = collection(db, "events");
      const futureDate = format(addDays(new Date(), 5), "yyyy-MM-dd");

      const q2 = query(
        eventsRef,
        where("userId", "==", user.uid),
        where("date", ">=", todayStr),
        where("date", "<=", futureDate)
      );
      const snap2 = await getDocs(q2);
      const events = snap2.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setUpcomingEvents(events);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const sortTasks = (tasks) =>
    tasks.slice().sort((a, b) => {
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return 0;
    });

  const toggleComplete = async (task) => {
    await updateDoc(doc(db, "todos", task.id), {
      completed: !task.completed,
    });

    setTodayTasks((prev) => ({
      today: prev.today.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ),
      tomorrow: prev.tomorrow.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  return (
    <div className="container py-4 text-white">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Fecha actual */}
          <div
            className="d-flex justify-content-center align-items-center gap-3 px-4 py-3 rounded-3 mb-4"
            style={{
              color: "var(--menta-color)",
              fontWeight: "500",
            }}
          >
            <i className="bi bi-calendar3" style={{ fontSize: "1.5rem" }}></i>
            <div style={{ fontSize: "1.25rem" }}>
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </div>
          </div>

          {/* TASKS */}
          <section className="mb-5">
            <TodoThumb
              title="Today"
              tasks={sortTasks(todayTasks.today)}
              onToggle={toggleComplete}
            />
          </section>

          {/* UPCOMING EVENTS (solo hoy) */}
          <section className="mb-5">
            <h4 className="mb-3">Events</h4>
            {upcomingEvents.filter((e) => e.date === todayStr).length === 0 ? (
              <p className="text-secondary">No events for today.</p>
            ) : (
              <EventThumb
                events={upcomingEvents.filter((e) => e.date === todayStr)}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
