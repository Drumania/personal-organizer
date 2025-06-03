export async function getTodayWeather(lat, lon) {
  const apiKey = import.meta.env.VITE_API_WHEATER;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error fetching weather");
  return res.json();
}
