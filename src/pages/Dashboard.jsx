import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayDate = format(today, "yyyy-MM-dd");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Get today's tasks
      const todosRef = collection(db, "todos");
      const q1 = query(
        todosRef,
        where("userId", "==", user.uid),
        where("date", "==", todayDate)
      );
      const snap1 = await getDocs(q1);
      const tasksToday = snap1.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get upcoming events (next 5 days)
      const eventsRef = collection(db, "events");
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const q2 = query(
        eventsRef,
        where("userId", "==", user.uid),
        where("date", ">=", todayDate),
        where("date", "<=", format(futureDate, "yyyy-MM-dd"))
      );
      const snap2 = await getDocs(q2);
      const events = snap2.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setTodayTasks(tasksToday);
      setUpcomingEvents(events);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-4">Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* TASKS TODAY */}
          <section className="mb-5">
            <h4 className="mb-3">Tasks for Today</h4>
            {todayTasks.length === 0 ? (
              <p className="text-secondary">No tasks for today.</p>
            ) : (
              <ul className="list-group">
                {todayTasks.map((task) => (
                  <li
                    key={task.id}
                    className={`list-group-item d-flex justify-content-between align-items-center bg-dark text-white ${
                      task.completed ? "text-decoration-line-through" : ""
                    }`}
                  >
                    {task.title}
                    {task.priority === "high" && (
                      <span className="badge bg-danger">High</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* UPCOMING EVENTS */}
          <section className="mb-5">
            <h4 className="mb-3">Upcoming Events</h4>
            {upcomingEvents.length === 0 ? (
              <p className="text-secondary">No upcoming events.</p>
            ) : (
              <ul className="list-group">
                {upcomingEvents.map((event) => (
                  <li
                    key={event.id}
                    className="list-group-item bg-dark text-white"
                  >
                    <strong>{event.title}</strong> — {event.date}{" "}
                    {event.time && <span>at {event.time}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* SUMMARY (placeholder) */}
          <section>
            <h4 className="mb-3">This Week</h4>
            <p>✔️ 3 tasks completed</p>
            <p>🕓 2 upcoming events</p>
            <p>🛒 5 items in your shopping list</p>
          </section>
        </>
      )}
    </div>
  );
}
