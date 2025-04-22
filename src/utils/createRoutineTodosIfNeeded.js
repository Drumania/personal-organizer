import { format } from "date-fns";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export const createRoutineTodosIfNeeded = async (userId, routines) => {
  const today = format(new Date(), "yyyy-MM-dd");

  const activeRoutines = routines.filter(
    (r) => r.unlocked && r.streak < (r.goal || 3)
  );
  console.log("Active routines for task creation:", activeRoutines); // DEBUG

  const q = query(
    collection(db, "todos"),
    where("userId", "==", userId),
    where("date", "==", today),
    where("type", "==", "routine")
  );

  const snap = await getDocs(q);
  const existingRoutineNames = snap.docs.map((doc) => doc.data().routineName);

  await Promise.all(
    activeRoutines.map(async (r) => {
      if (!existingRoutineNames.includes(r.name)) {
        console.log("Creating routine task:", r.name); // DEBUG
        await addDoc(collection(db, "todos"), {
          userId,
          title: r.name,
          completed: false,
          date: today,
          priority: "normal",
          type: "routine",
          routineName: r.name,
          createdAt: new Date().toISOString(),
        });
      }
    })
  );
};
