import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function Navbar() {
  const navigate = useNavigate();
  const { dark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [dateStr, setDateStr] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const avatarLetter = user?.displayName?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    const now = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" };
    const date = now.toLocaleDateString("es-AR", options);

    setDateStr(capitalize(date));
  }, []);

  return (
    <nav className="navbar px-3 py-4 justify-content-between">
      <Link className="wrap-logo" to="/">
        <img src="/logo.png" alt="menta" />
      </Link>

      <h1>{dateStr}</h1>

      <div className="position-relative d-flex align-items-center gap-3">
        {/* Avatar */}
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className="avatar"
            onClick={() => setMenuOpen(!menuOpen)}
          />
        ) : (
          <div
            className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center"
            style={{
              width: 36,
              height: 36,
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {avatarLetter}
          </div>
        )}

        {/* Botón de tres puntitos */}
        <BsThreeDotsVertical
          size={20}
          style={{ cursor: "pointer" }}
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {/* Menú flotante */}
        {menuOpen && (
          <div ref={menuRef} className="floating-menu">
            <p className="fw-bold mb-2">{user?.displayName || user.email}</p>
            {/* <button className="nav-link py-3" onClick={toggleTheme}>
              {dark ? "Switch to Light" : "Switch to Dark"}
            </button> */}
            <Link className="nav-link py-3" to="/settings">
              Settings
            </Link>
            <button
              className="btn btn-sm btn-danger w-100 mt-3"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
