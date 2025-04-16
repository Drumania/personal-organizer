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
  const [eventDates, setEventDates] = useState([]);
  const [showModal, setShowModal] = useState(false);

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

  const fetchMonthEvents = async (activeStartDate) => {
    const q = query(collection(db, "events"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const counts = data.reduce((acc, event) => {
      if (!acc[event.date]) acc[event.date] = 0;
      acc[event.date]++;
      return acc;
    }, {});

    setEventDates(counts); // ahora es un objeto tipo { "2025-04-16": 3, ... }
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

  useEffect(() => {
    if (user) {
      fetchMonthEvents(new Date());
    }
  }, [user]);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  return (
    <div className="container py-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Calendar</h2>
        <button className="btn btn-menta" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg"></i>
          Add Event
        </button>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="bg-light rounded p-2"
            onActiveStartDateChange={({ activeStartDate }) =>
              fetchMonthEvents(activeStartDate)
            }
            tileContent={({ date, view }) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const count = eventDates[dateStr];

              if (view === "month" && count) {
                return <div className="badge-calendar">{count}</div>;
              }

              return null;
            }}
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

          {showModal && (
            <div
              className="custom-modal-backdrop"
              onClick={() => setShowModal(false)}
            >
              <div
                className="custom-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content bg-dark text-white p-3 rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">New Event</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      handleAddEvent(e);
                      setShowModal(false);
                    }}
                  >
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
          )}
        </div>
      </div>
    </div>
  );
}
