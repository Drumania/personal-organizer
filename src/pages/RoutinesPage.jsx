import { useEffect, useState } from "react";
import { db } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import RoutineTracker from "@/components/RoutineTracker";
import { format } from "date-fns";

const todayStr = format(new Date(), "yyyy-MM-dd");

// Lista inicial de rutinas
const initialRoutines = [
  {
    name: "Drink Water",
    level: 1,
    streak: 0,
    goal: 3,
    doneToday: false,
    unlocked: true,
    lastCompletedDate: null,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Stretching",
    level: 1,
    streak: 0,
    goal: 3,
    doneToday: false,
    unlocked: false,
    unlockCondition: "Complete Drink Water for 3 days",
    lastCompletedDate: null,
    createdAt: null,
  },
  {
    name: "Wake Up Early",
    level: 2,
    streak: 0,
    goal: 3,
    doneToday: false,
    unlocked: false,
    unlockCondition: "Complete Stretching for 3 days",
    lastCompletedDate: null,
    createdAt: null,
  },
  {
    name: "5-min Meditation",
    level: 2,
    streak: 0,
    goal: 3,
    doneToday: false,
    unlocked: false,
    unlockCondition: "Complete Wake Up Early for 3 days",
    lastCompletedDate: null,
    createdAt: null,
  },
  {
    name: "No Sugar Today",
    level: 3,
    streak: 0,
    goal: 3,
    doneToday: false,
    unlocked: false,
    unlockCondition: "Complete 5-min Meditation for 3 days",
    lastCompletedDate: null,
    createdAt: null,
  },
  {
    name: "Read 10 min",
    level: 3,
    streak: 0,
    goal: 3,
    doneToday: false,
    unlocked: false,
    unlockCondition: "Complete No Sugar Today for 3 days",
    lastCompletedDate: null,
    createdAt: null,
  },
];

export default function RoutinesPage() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);

  // Inicializa o carga las rutinas
  useEffect(() => {
    const fetchRoutines = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (!data.routines || data.routines.length === 0) {
          await updateDoc(userRef, { routines: initialRoutines });
          setRoutines(initialRoutines);
        } else {
          setRoutines(data.routines);
        }
      }
    };

    fetchRoutines();
  }, [user]);

  // Desbloqueo automático
  const checkProgression = (updated) => {
    let changed = false;

    const progressed = updated.map((r) => {
      if (!r.unlocked) {
        const dependency = {
          Stretching: "Drink Water",
          "Wake Up Early": "Stretching",
          "5-min Meditation": "Wake Up Early",
          "No Sugar Today": "5-min Meditation",
          "Read 10 min": "No Sugar Today",
        };

        const dependsOn = dependency[r.name];
        if (
          dependsOn &&
          updated.find((d) => d.name === dependsOn && d.streak >= d.goal)
        ) {
          changed = true;
          return {
            ...r,
            unlocked: true,
            createdAt: new Date().toISOString(),
          };
        }
      }
      return r;
    });

    return changed ? progressed : updated;
  };

  // Marcar rutina como hecha hoy
  const handleToggleRoutine = async (routineName) => {
    const updated = routines.map((r) => {
      if (r.name === routineName && r.unlocked) {
        const isDone = r.lastCompletedDate === todayStr;
        if (!isDone && r.streak < r.goal) {
          return {
            ...r,
            doneToday: true,
            streak: r.streak + 1,
            lastCompletedDate: todayStr,
          };
        }
      }
      return r;
    });

    const progressedRoutines = checkProgression(updated);
    setRoutines(progressedRoutines);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { routines: progressedRoutines });
  };

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-4">My Routines 🌿</h2>
      <RoutineTracker routines={routines} onToggle={handleToggleRoutine} />
    </div>
  );
}
