import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// import RoutinesPage from "./pages/RoutinesPage";
// import TodoPage from "./pages/TodoPage";
import CalendarPage from "./pages/CalendarPage";
import ShoppingList from "./pages/ShoppingList";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LinkBar from "./components/LinkBar";
import UserSettings from "./components/UserSettings";
import NotificationWatcher from "@/components/NotificationWatcher";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading)
    return (
      <div className="text-center mt-5 text-white">
        <div className="loader-menta"></div>
      </div>
    );

  return (
    <>
      {user && (
        <>
          <Navbar />
          {/* {location.pathname !== "/settings" && <LinkBar />} */}
          <NotificationWatcher />
        </>
      )}

      <Routes>
        {!user ? (
          <Route path="/*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/shopping" element={<ShoppingList />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}
