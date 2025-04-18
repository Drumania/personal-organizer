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
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split("-");
    const targetDate = new Date(Number(year), Number(month) - 1, Number(day));

    const diff = differenceInCalendarDays(targetDate, today);

    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff > 1) return `In ${diff} days`;
    return "";
  }

  function getItemClass(dateStr) {
    const [y, m, d] = dateStr.split("-");
    const targetDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diff = differenceInCalendarDays(targetDate, today);
    if (diff === 0) return "bg-menta text-dark";
    if (diff === 1) return "bg-dark-menta text-white";
    return "bg-dark text-white";
  }

  function getBadgeClass(dateStr) {
    const [y, m, d] = dateStr.split("-");
    const targetDate = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diff = differenceInCalendarDays(targetDate, today);
    if (diff === 0) return "bg-dark-menta text-dark";
    if (diff === 1) return "bg-menta text-dark";
    return "bg-menta text-dark";
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
        const itemClass = getItemClass(event.date);
        const badgeClass = getBadgeClass(event.date);

        return (
          <li
            key={event.id}
            className={`list-group-item d-flex justify-content-between align-items-start position-relative ${itemClass}`}
          >
            <div className="w-100">
              <div className="d-flex justify-content-between align-items-center">
                <strong>{event.title}</strong>

                {relativeDay && (
                  <span className={`badge ${badgeClass} ms-2`}>
                    {relativeDay}
                  </span>
                )}
              </div>

              <small className="d-block mt-1">
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
                  <span className="text-info ms-2">({event.recurrence})</span>
                )}
              </small>
            </div>

            {onEdit && (
              <button
                className="btn btn-sm text-white ms-2"
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
