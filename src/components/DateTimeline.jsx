import { useEffect } from "react";
import { format, isSameDay } from "date-fns";
import {
  SunIcon,
  CloudIcon,
  BoltIcon,
  Bars3Icon, // Niebla
} from "@heroicons/react/24/solid";
import React from "react";

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
  const getHeroWeatherIcon = (iconCode) => {
    const codeMap = {
      // Despejado siempre sol
      "01d": <SunIcon className="h-5 w-5 text-yellow-400" />,
      "01n": <SunIcon className="h-5 w-5 text-yellow-400" />, // 🌙 → ☀️

      // Nubes y otros
      "02d": <CloudIcon className="h-5 w-5 text-gray-300" />,
      "02n": <CloudIcon className="h-5 w-5 text-gray-500" />,
      "03d": <CloudIcon className="h-5 w-5 text-gray-400" />,
      "03n": <CloudIcon className="h-5 w-5 text-gray-600" />,
      "04d": <CloudIcon className="h-5 w-5 text-gray-500" />,
      "04n": <CloudIcon className="h-5 w-5 text-gray-700" />,

      // Lluvia como nubes azules
      "09d": <CloudIcon className="h-5 w-5 text-blue-400" />,
      "09n": <CloudIcon className="h-5 w-5 text-blue-600" />,
      "10d": <CloudIcon className="h-5 w-5 text-blue-500" />,
      "10n": <CloudIcon className="h-5 w-5 text-blue-700" />,

      // Tormentas
      "11d": <BoltIcon className="h-5 w-5 text-yellow-500" />,
      "11n": <BoltIcon className="h-5 w-5 text-yellow-700" />,

      // Nieve
      "13d": <CloudIcon className="h-5 w-5 text-white" />,
      "13n": <CloudIcon className="h-5 w-5 text-white" />,

      // Niebla
      "50d": <Bars3Icon className="h-5 w-5 text-gray-400" />,
      "50n": <Bars3Icon className="h-5 w-5 text-gray-500" />,
    };
    return codeMap[iconCode] || <CloudIcon className="h-5 w-5 text-white-50" />;
  };

  useEffect(() => {
    console.log("WeatherData:", weatherData);
    console.log("TodayStr:", format(today, "yyyy-MM-dd"));
    console.log("Today Weather:", weatherData[format(today, "yyyy-MM-dd")]);
  }, [weatherData]);

  return (
    <div
      className="d-flex gap-3 mb-5 px-2 timeline-scroll"
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
        const weatherTemp = weatherForDay
          ? Math.round(weatherForDay.main.temp)
          : null;

        return (
          <div
            key={dateStr}
            className={`px-2`}
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
            {/* Día + Clima */}
            <div className="d-flex justify-content-between align-items-center mb-1">
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

              {weatherForDay && (
                <div className="text-center">
                  {getHeroWeatherIcon(weatherForDay.weather[0].icon)}
                  <div style={{ fontSize: "0.7rem" }}>{weatherTemp}°C</div>
                </div>
              )}
            </div>

            {/* Día de la semana */}
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

            {/* Tareas/Eventos */}
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
