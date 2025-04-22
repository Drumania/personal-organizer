import React from "react";

export default function RoutineTracker({ routines, onToggle }) {
  console.log(routines);
  return (
    <div className="mt-4">
      <h4 className="mb-3">Daily Routines 🌞</h4>
      <ul className="list-group">
        {routines.map((routine, index) => (
          <li
            key={index}
            className={`list-group-item d-flex justify-content-between align-items-center flex-wrap ${
              routine.unlocked && routine.doneToday
                ? "bg-success text-white"
                : ""
            } ${!routine.unlocked ? "text-muted" : ""}`}
            style={{
              cursor: routine.unlocked ? "pointer" : "not-allowed",
              opacity: routine.unlocked ? 1 : 0.6,
              transition: "all 0.3s ease",
            }}
            onClick={() => routine.unlocked && onToggle(routine.name)}
          >
            <div>
              <strong>{routine.name}</strong>
              {!routine.unlocked && routine.unlockCondition && (
                <div style={{ fontSize: "0.8rem" }}>
                  Unlock after: {routine.unlockCondition}
                </div>
              )}
            </div>

            {routine.unlocked && (
              <div className="d-flex gap-1">
                {[...Array(routine.goal)].map((_, i) => (
                  <span key={i} style={{ fontSize: "1.2rem" }}>
                    {i < routine.streak ? "✅" : "⬜"}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
