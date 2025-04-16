import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const q = query(
      collection(db, "events"),
      where("userId", "==", user.uid),
      where("date", "==", dateStr)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEvents(data);
    setLoading(false);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    await addDoc(collection(db, "events"), {
      userId: user.uid,
      title: newTitle,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: newTime,
      recurrence,
      createdAt: Timestamp.now(),
    });

    setNewTitle("");
    setNewTime("");
    setRecurrence("none");
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-4">Calendar</h2>

      <div className="row">
        <div className="col-md-6 mb-4">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="bg-light rounded p-2"
          />
        </div>

        <div className="col-md-6">
          <h5>Events for {format(selectedDate, "PPP")}</h5>

          {loading ? (
            <p>Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-secondary">No events this day.</p>
          ) : (
            <ul className="list-group mb-4">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="list-group-item bg-dark text-white"
                >
                  <strong>{event.title}</strong>{" "}
                  {event.time && <span>at {event.time}</span>}{" "}
                  {event.recurrence !== "none" && (
                    <small className="text-info">({event.recurrence})</small>
                  )}
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddEvent} className="mb-3">
            <div className="mb-2">
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Event title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <input
                type="time"
                className="form-control bg-dark text-white"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <select
                className="form-select bg-dark text-white"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
              >
                <option value="none">No recurrence</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button className="btn btn-menta w-100" type="submit">
              Add Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
