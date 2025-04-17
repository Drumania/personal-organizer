import { useEffect, useState, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/contexts/AuthContext";
import EventThumb from "@/components/EventThumb"; // asegurate del path

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(selectedDate);
  const [newTime, setNewTime] = useState("");
  const [recurrence, setRecurrence] = useState("none");
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const titleRef = useRef(null);
  const [editingId, setEditingId] = useState(null);

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

    const payload = {
      userId: user.uid,
      title: newTitle,
      date: format(newDate, "yyyy-MM-dd"),
      time: newTime,
      recurrence,
      createdAt: Timestamp.now(),
    };

    if (editingId) {
      // Modo edición
      await updateDoc(doc(db, "events", editingId), payload);
    } else {
      // Modo nuevo
      await addDoc(collection(db, "events"), payload);
    }

    // Reset
    setNewTitle("");
    setNewTime("");
    setRecurrence("none");
    setEditingId(null);

    fetchEvents();
    fetchMonthEvents(selectedDate);
  };

  const handleDeleteEvent = async (eventId) => {
    await deleteDoc(doc(db, "events", eventId));
    fetchEvents(); // actualiza lista del día
    fetchMonthEvents(selectedDate); // actualiza puntos en el calendario
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
      setTimeout(() => {
        titleRef.current?.focus();
      }, 100); // le damos un pelito de delay para asegurar el render
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  return (
    <div className="container py-4 text-white">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Calendar</h2>
        <button
          className="btn btn-menta"
          onClick={() => {
            setNewDate(selectedDate);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Add Event
        </button>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="custom-calendar"
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
            tileClassName={({ date, view }) => {
              if (view !== "month") return "";

              const today = new Date();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isPast = date < new Date(today.toDateString()); // solo antes de hoy, sin hora

              return [
                isWeekend ? "tile-weekend" : "",
                isPast ? "tile-past" : "",
              ]
                .filter(Boolean)
                .join(" ");
            }}
          />
        </div>

        <div className="col-12">
          <h5 className="mb-4">Events for {format(selectedDate, "PPP")}</h5>

          {loading ? (
            <p>Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-secondary">No events this day.</p>
          ) : (
            <EventThumb
              events={events}
              onEdit={(e) => {
                setNewTitle(e.title);
                setNewDate(new Date(e.date));
                setNewTime(e.time || "");
                setRecurrence(e.recurrence || "none");
                setEditingId(e.id); // 👈 importante para saber si estamos editando
                setShowModal(true);
              }}
              onDelete={handleDeleteEvent}
            />
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
                    <h5 className="m-0">
                      {editingId ? "Edit Event" : "New Event"}
                    </h5>

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
                    {/* Título */}
                    <div className="mb-2">
                      <textarea
                        ref={titleRef}
                        className="form-control"
                        placeholder="Event title"
                        rows="3"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                      />
                    </div>

                    {/* Fecha (solo día) */}
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control bg-dark text-white"
                        value={format(newDate, "yyyy-MM-dd")}
                        onChange={(e) => {
                          const [year, month, day] = e.target.value.split("-");
                          const newSelected = new Date(year, month - 1, day);
                          setNewDate(newSelected);
                          setSelectedDate(newSelected);
                        }}
                      />
                    </div>

                    <details className="mt-3 mb-5">
                      <summary className="mb-2">More Options</summary>
                      <div className="details-content">
                        {/* Hora */}
                        <div className="mb-2">
                          <label className="form-label">Time (optional)</label>
                          <input
                            type="time"
                            className="form-control bg-dark text-white"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                          />
                        </div>

                        {/* Recurrence
                        <div className="mb-2">
                          <label className="form-label">Recurrence</label>
                          <select
                            className="form-select bg-dark text-white"
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value)}
                          >
                            <option value="none">None</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>

                          {/* Mensaje explicativo dinámico
                          <small className="text-secondary mt-1 d-block">
                            {recurrence === "none" &&
                              "This event will not repeat."}
                            {recurrence === "daily" &&
                              "This event will repeat every day."}
                            {recurrence === "weekly" &&
                              "This event will repeat every week."}
                            {recurrence === "monthly" &&
                              "This event will repeat every month."}
                          </small>
                        </div> */}
                      </div>

                      {editingId && (
                        <button
                          className="btn btn-outline-danger w-100 my-3"
                          type="button"
                          onClick={() => {
                            handleDeleteEvent(editingId);
                            setShowModal(false);
                          }}
                        >
                          Delete Event
                        </button>
                      )}
                    </details>

                    <button className="btn btn-menta w-100" type="submit">
                      Save Event
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
