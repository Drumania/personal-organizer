import { useState, useEffect, useRef } from "react";

export default function EventThumb({ events = [], onEdit, onDelete }) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!events.length) {
    return <p className="text-secondary">No events this day.</p>;
  }

  return (
    <ul className="list-group mb-4">
      {events.map((event) => {
        const isPastEventWithNotify = () => {
          if (!event?.time || !event?.date || !event?.notify) return false;
          const [hours, minutes] = event.time.split(":");
          const eventDateTime = new Date(event.date);
          eventDateTime.setHours(Number(hours));
          eventDateTime.setMinutes(Number(minutes));
          return eventDateTime < new Date();
        };

        return (
          <li
            key={event.id}
            className="list-group-item bg-dark text-white d-flex justify-content-between align-items-start position-relative"
          >
            <div>
              <strong>{event.title}</strong>
              <br />
              <small>
                {event.time && (
                  <span className="opacity-50">at {event.time}</span>
                )}{" "}
                {event.notify && <span className="text-danger fw-bold">!</span>}
                {event.recurrence !== "none" && (
                  <small className="text-info ms-2">({event.recurrence})</small>
                )}
              </small>
            </div>

            <button
              className="btn btn-sm text-white"
              onClick={() => onEdit(event)}
              title="Edit"
            >
              <i className="bi bi-gear"></i>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
