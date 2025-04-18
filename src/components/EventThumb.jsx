import { useState, useEffect, useRef } from "react";
import { differenceInCalendarDays } from "date-fns";

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

  function getRelativeDayLabel(dateStr) {
    const today = new Date();
    const targetDate = new Date(dateStr);
    const diff = differenceInCalendarDays(targetDate, today);

    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1) return `In ${diff} days`;
    return "";
  }

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

        const relativeDay = getRelativeDayLabel(event.date);

        return (
          <li
            key={event.id}
            className="list-group-item bg-dark text-white d-flex justify-content-between align-items-start position-relative"
          >
            <div>
              <strong>{event.title}</strong>
              <br />
              <small className="d-block mt-1">
                {relativeDay && (
                  <span className="badge bg-menta text-dark me-2">
                    {relativeDay}
                  </span>
                )}
                {event.time && (
                  <span className="opacity-50">at {event.time}</span>
                )}{" "}
                {isPastEventWithNotify() && (
                  <span
                    className="text-danger fw-bold"
                    title="This event had a reminder"
                  >
                    !
                  </span>
                )}
                {event.recurrence !== "none" && (
                  <small className="text-info ms-2">({event.recurrence})</small>
                )}
              </small>
            </div>

            {onEdit && (
              <button
                className="btn btn-sm text-white"
                onClick={() => onEdit(event)}
                title="Edit"
              >
                <i className="bi bi-gear"></i>
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
