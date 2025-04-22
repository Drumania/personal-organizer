export default function RoutineThumb({
  routine,
  isAdded,
  loading,
  onAdd,
  onRemove,
}) {
  const handleClick = async () => {
    if (!isAdded) {
      await onAdd(routine);
    } else {
      const confirm = window.confirm(
        `Remove "${routine.name}" and delete its tasks?`
      );
      if (!confirm) return;
      await onRemove(routine.name);
    }
  };

  return (
    <div className="col-6 col-lg-3">
      <div
        className="card text-white h-100 border-0 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #1f1f1f, #2c2c2c)",
          borderRadius: "1rem",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <div className="card-body d-flex flex-column justify-content-between p-4">
          {/* Icono decorativo */}
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

          {/* Título */}
          <h5
            className="card-title mb-2 text-center"
            style={{ fontWeight: "600", fontSize: "1.1rem" }}
          >
            {routine.name}
          </h5>

          {/* Frecuencia */}
          <p
            className="text-secondary text-center mb-4"
            style={{ fontSize: "0.85rem" }}
          >
            {routine.frequency}
          </p>

          {/* Botón */}
          <button
            className={`btn ${
              isAdded ? "btn-outline-success" : "btn-menta"
            } rounded-pill w-100`}
            onClick={handleClick}
            disabled={loading}
          >
            {isAdded ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
