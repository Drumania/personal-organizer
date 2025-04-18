import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { format } from "date-fns";

export default function NotificationWatcher() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let interval;

    const setupNotificationCheck = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) return;

        const { notificationHour } = userSnap.data();
        if (!notificationHour) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        interval = setInterval(async () => {
          const now = new Date();
          const currentTime = format(now, "HH:mm");

          if (currentTime === notificationHour) {
            // Obtener tareas del día incompletas
            const today = format(new Date(), "yyyy-MM-dd");
            const q = query(
              collection(db, "todos"),
              where("userId", "==", user.uid),
              where("date", "==", today),
              where("completed", "==", false)
            );
            const snap = await getDocs(q);
            const tasks = snap.docs.map((doc) => doc.data());

            if (tasks.length > 0) {
              new Notification("📋 You have tasks today", {
                body: `You have ${tasks.length} incomplete ${
                  tasks.length === 1 ? "task" : "tasks"
                } for today.`,
                icon: "/vite.svg", // o el ícono que quieras
              });
            }
          }
        }, 60 * 1000); // cada minuto
      } catch (err) {
        console.error("NotificationWatcher error:", err);
      }
    };

    setupNotificationCheck();

    return () => clearInterval(interval);
  }, [user]);

  return null;
}
