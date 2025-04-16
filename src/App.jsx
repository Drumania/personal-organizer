import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TodoPage from "./pages/TodoPage";
import CalendarPage from "./pages/CalendarPage";
import ShoppingList from "./pages/ShoppingList";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "@/components/Navbar"; // asegurate del path
import LinkBar from "./components/LinkBar";

export default function App() {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="text-center mt-5 text-white">Loading...</div>;

  return (
    <>
      {user && (
        <>
          <Navbar />
          <LinkBar />
        </>
      )}
      {/* MOSTRAR NAVBAR FUERA DE ROUTES */}
      <Routes>
        {!user ? (
          <Route path="/*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/shopping" element={<ShoppingList />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </>
  );
}
