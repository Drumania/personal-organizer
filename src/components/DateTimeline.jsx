import { format, isSameDay } from "date-fns";

export default function DateTimeline({
  dateRange,
  today,
  activeDate,
  setActiveDate,
  getDayTasks,
  getDayEvents,
  timelineRef,
  weatherData,
}) {
  const getWeatherIconClass = (iconCode) => {
    const codeMap = {
      "01d": "wi-day-sunny",
      "01n": "wi-night-clear",
      "02d": "wi-day-cloudy",
      "02n": "wi-night-alt-cloudy",
      "03d": "wi-cloud",
      "03n": "wi-cloud",
      "04d": "wi-cloudy",
      "04n": "wi-cloudy",
      "09d": "wi-showers",
      "09n": "wi-showers",
      "10d": "wi-day-rain",
      "10n": "wi-night-alt-rain",
      "11d": "wi-thunderstorm",
      "11n": "wi-thunderstorm",
      "13d": "wi-snow",
      "13n": "wi-snow",
      "50d": "wi-fog",
      "50n": "wi-fog",
    };
    return codeMap[iconCode] || "wi-na";
  };

  return (
    <div
      className="d-flex gap-3 overflow-auto mb-5 px-2"
      style={{
        WebkitOverflowScrolling: "touch",
        cursor: "grab",
      }}
      ref={timelineRef}
      onMouseDown={(e) => {
        e.currentTarget.style.cursor = "grabbing";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.cursor = "grab";
      }}
    >
      {dateRange.map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const isToday = isSameDay(date, today);
        const isActive = isSameDay(date, activeDate);
        const tasksCount = getDayTasks(date).length;
        const eventsCount = getDayEvents(date).length;

        const weatherForDay = weatherData[dateStr];
        const weatherIcon = weatherForDay
          ? `http://openweathermap.org/img/wn/${weatherForDay.weather[0].icon}@2x.png`
          : null;
        const weatherTemp = weatherForDay
          ? Math.round(weatherForDay.main.temp)
          : null;

        return (
          <div
            key={dateStr}
            className={` px-2`}
            style={{
              minWidth: "100px",
              cursor: "pointer",
              borderTop: isToday
                ? "3px solid var(--menta-color)"
                : isActive
                ? "2px solid var(--menta-color)"
                : "1px solid rgba(255,255,255,0.2)",
              backgroundColor: isToday
                ? "#263242"
                : isActive
                ? "#26324259"
                : "transparent",
              padding: "10px 0",
              transition: "all 0.2s ease",
            }}
            onClick={() => setActiveDate(date)}
          >
            <div className="d-flex justify-content-between">
              <div
                className={`fw-bold ${
                  isToday
                    ? "text-menta"
                    : isActive
                    ? "text-white"
                    : "text-white-50"
                }`}
                style={{ fontSize: "1.8rem" }}
              >
                {format(date, "d")}
              </div>

              {weatherIcon && (
                <div className="mt-1 text-white-50 text-center">
                  <i
                    className={`wi ${getWeatherIconClass(
                      weatherForDay.weather[0].icon
                    )}`}
                    style={{ fontSize: "1.2rem" }}
                  ></i>
                  <div style={{ fontSize: "0.7rem" }}>{weatherTemp}°C</div>
                </div>
              )}
            </div>

            <div
              className={`text-uppercase pb-2 ${
                isToday ? "text-menta fw-bold" : "text-white-50"
              }`}
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              {format(date, "EEE - MMMM")}
            </div>

            {/* Tareas/Eventos como texto simple */}
            <div className="mt-2" style={{ fontSize: "0.7rem" }}>
              {tasksCount > 0 && (
                <div className="text-info">{tasksCount} tasks</div>
              )}
              {eventsCount > 0 && (
                <div className="text-warning">{eventsCount} events</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
