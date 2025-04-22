import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { gardenRules } from "./gardenRules";

// 🌱 Initialize default garden if none exists
export const initializeGardenIfNeeded = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    if (!data.gardenGrid || data.gardenGrid.length === 0) {
      const initialGarden = [
        { level: 0, suggestion: "Complete all your tasks today" },
        { level: 0, suggestion: "Stick to one routine for 3 days" },
        { level: 0, suggestion: "Build a 3-day streak" },
        { level: 0, suggestion: "Unlock your second routine" },
        { level: 0, suggestion: "Stretch 3 days in a row" },
        { level: 0, suggestion: "Drink water for 3 days in a row" },
        { level: 0, suggestion: "Complete 5 tasks in one day" },
        { level: 0, suggestion: "Maintain a level 2 routine" },
        { level: 0, suggestion: "Be consistent for 7 days" },
        { level: 0, suggestion: "Unlock a level 3 routine" },
        { level: 0, suggestion: "Start a new routine" },
        { level: 0, suggestion: "Keep your garden green for 5 days" },
        { level: 0, suggestion: "Complete all tasks for 3 days" },
        { level: 0, suggestion: "Wake up early 3 days in a row" },
        { level: 0, suggestion: "Finish all your routines in one day" },
        { level: 0, suggestion: "Reach a 5-day streak" },
      ];

      await updateDoc(userRef, { gardenGrid: initialGarden });
      return initialGarden;
    } else {
      return data.gardenGrid;
    }
  }
  return [];
};

// 🌸 Add a new garden point
export const addGardenPoint = async (userId, newPoint) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentGrid = userSnap.data().gardenGrid || [];
    const updatedGrid = [...currentGrid];
    const firstEmptyIndex = updatedGrid.findIndex((p) => p.level === 0);

    if (firstEmptyIndex !== -1) {
      updatedGrid[firstEmptyIndex] = newPoint;
    } else {
      updatedGrid.push(newPoint);
    }

    await updateDoc(userRef, { gardenGrid: updatedGrid });
    return updatedGrid;
  }
  return [];
};

// 🌞 Check if all tasks are completed today and reward
export const checkAllTasksCompleted = async (userId, todayTasks, todayStr) => {
  if (todayTasks.length > 0 && todayTasks.every((t) => t.completed)) {
    const newPoint = {
      level: 1,
      title: "Daily Task Completion",
      date: todayStr,
      detail: "All tasks completed for today",
    };
    return await addGardenPoint(userId, newPoint);
  }
  return null;
};

export const evaluateGardenAchievements = async (
  userId,
  { tasks, streak, routines, todayStr }
) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return [];

  const currentGrid = userSnap.data().gardenGrid || [];
  let updated = false;

  const updatedGrid = currentGrid.map((cell) => {
    if (cell.level === 0 && cell.suggestion) {
      const matchedRule = gardenRules.find(
        (rule) => rule.match === cell.suggestion
      );
      if (matchedRule && matchedRule.check({ tasks, streak, routines })) {
        updated = true;
        return {
          ...matchedRule.point,
          date: todayStr,
        };
      }
    }
    return cell;
  });

  if (updated) {
    await updateDoc(userRef, { gardenGrid: updatedGrid });
    return updatedGrid;
  }

  return null;
};
