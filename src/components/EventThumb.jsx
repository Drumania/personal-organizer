// src/components/EventThumb.jsx
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
      {events.map((event) => (
        <li
          key={event.id}
          className="list-group-item bg-dark text-white d-flex justify-content-between align-items-start position-relative"
        >
          <div>
            <strong>{event.title}</strong>{" "}
            {event.time && <span>at {event.time}</span>}{" "}
            {event.recurrence !== "none" && (
              <small className="text-info">({event.recurrence})</small>
            )}
          </div>

          {/* Botón ⋯ */}
          <button
            className="btn btn-sm text-white"
            onClick={() => onEdit(event)}
            title="Edit"
          >
            <i className="bi bi-gear"></i>
          </button>

          {/* Menú flotante contextual */}
          {activeMenuId === event.id && (
            <div
              ref={menuRef}
              className="position-absolute end-0 mt-2 p-2 bg-dark border border-secondary rounded shadow"
              style={{ zIndex: 1000 }}
            >
              <button
                className="btn btn-sm btn-outline-light w-100 mb-1"
                onClick={() => {
                  onEdit(event);
                  setActiveMenuId(null);
                }}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-sm btn-outline-danger w-100"
                onClick={() => {
                  onDelete(event.id);
                  setActiveMenuId(null);
                }}
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
