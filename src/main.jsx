import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/global.css";
import "react-calendar/dist/Calendar.css";

// Registro del Service Worker para detectar updates
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("¡Nueva versión disponible! ¿Deseás actualizar ahora?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App lista para funcionar offline");
  },
});

function RootApp() {
  useEffect(() => {
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.style.opacity = 0;
      splash.style.transition = "opacity 0.5s ease";
      setTimeout(() => splash.remove(), 500);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
