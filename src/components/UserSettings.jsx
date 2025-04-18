// src/pages/UserSettings.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export default function UserSettings() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [notificationHour, setNotificationHour] = useState("09:00");
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || user.displayName || "");
        setNotificationHour(data.notificationHour || "09:00");
      } else {
        // si no existe, usamos valores por defecto
        setDisplayName(user.displayName || "");
      }

      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    const ref = doc(db, "users", user.uid);
    await setDoc(
      ref,
      {
        displayName,
        notificationHour,
      },
      { merge: true }
    );

    alert("✅ Profile updated!");
  };

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-4">User Settings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Imagen de perfil */}
          <div className="mb-4">
            <label className="form-label">Profile Photo</label>
            <div className="d-flex align-items-center gap-3">
              <img
                src={
                  previewImg || user.photoURL || "https://placehold.co/80x80"
                }
                alt="Profile"
                width={80}
                height={80}
                className="rounded-circle border"
              />
              <input
                type="file"
                accept="image/*"
                className="form-control bg-dark text-white"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreviewImg(url);
                    // más adelante lo subimos al storage
                  }
                }}
              />
            </div>
          </div>

          {/* Nombre */}
          <div className="mb-3">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              className="form-control bg-dark text-white"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control bg-dark text-white"
              value={user.email}
              readOnly
              disabled
            />
          </div>

          {/* Hora de notificación */}
          <div className="mb-4">
            <label className="form-label">Notification Time</label>
            <input
              type="time"
              className="form-control bg-dark text-white"
              value={notificationHour}
              onChange={(e) => setNotificationHour(e.target.value)}
            />
            <small className="text-secondary">
              You’ll get a reminder for today’s tasks at this time (while app is
              open).
            </small>
          </div>

          {/* Guardar */}
          <button className="btn btn-menta w-100" onClick={handleSave}>
            Save Settings
          </button>
        </form>
      )}
    </div>
  );
}
