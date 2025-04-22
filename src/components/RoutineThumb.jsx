export default function RoutineThumb({ routine, isAdded, loading, onClick }) {
  const handleClick = async () => {
    await onClick(routine);
  };

  return (
    <div className="col-6 col-lg-3">
      <div
        className="card text-white h-100 border-0 shadow-sm"
        style={{
          background: isAdded ? "#263242" : "#202b39",
          borderRadius: "1rem",
          border: isAdded ? "2px solid var(--menta-color)" : "none",
          transition: "transform 0.2s ease, background 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <div className="card-body d-flex flex-column justify-content-between p-4">
          <div
            className="d-flex align-items-center justify-content-center mb-3"
            style={{
              background: "#2a2a2a",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              fontSize: "1.5rem",
              color: "#6c757d",
              alignSelf: "center",
            }}
          >
            <i className="bi bi-stars"></i>
          </div>

          <h5
            className="card-title mb-2 text-center"
            style={{ fontWeight: "600", fontSize: "1.1rem" }}
          >
            {routine.name}
          </h5>

          <p
            className="text-secondary text-center mb-4"
            style={{ fontSize: "0.85rem" }}
          >
            {routine.frequency}
          </p>

          <button
            className={`btn ${
              isAdded ? "btn-outline-menta" : "btn-menta"
            } rounded-pill w-100`}
            onClick={handleClick}
            disabled={loading}
          >
            {isAdded ? "Remove" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
