import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TodoPage from "./pages/TodoPage";
import CalendarPage from "./pages/CalendarPage";
import ShoppingList from "./pages/ShoppingList";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "@/components/Navbar";
import LinkBar from "./components/LinkBar";
import UserSettings from "./components/UserSettings";
import NotificationWatcher from "@/components/NotificationWatcher";
import SwipeWrapper from "./components/SwipeWrapper";

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
          {/* Ocultar LinkBar en la ruta /settings */}
          {location.pathname !== "/settings" && <LinkBar />}
          <NotificationWatcher />
        </>
      )}

      <Routes>
        {!user ? (
          <Route path="/*" element={<Login />} />
        ) : (
          <>
            <Route
              path="/"
              element={
                <SwipeWrapper>
                  <Dashboard />
                </SwipeWrapper>
              }
            />
            <Route
              path="/todos"
              element={
                <SwipeWrapper>
                  <TodoPage />
                </SwipeWrapper>
              }
            />
            <Route
              path="/calendar"
              element={
                <SwipeWrapper>
                  <CalendarPage />
                </SwipeWrapper>
              }
            />
            <Route
              path="/shopping"
              element={
                <SwipeWrapper>
                  <ShoppingList />
                </SwipeWrapper>
              }
            />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}
