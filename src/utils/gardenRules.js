export const gardenRules = [
  {
    match: "Complete all your tasks today",
    check: ({ tasks }) => tasks.length > 0 && tasks.every((t) => t.completed),
    point: {
      level: 1,
      title: "Daily Task Completion",
      detail: "All tasks completed today",
    },
  },
  {
    match: "Stick to one routine for 3 days",
    check: ({ routines }) => routines.some((r) => r.streak >= 3),
    point: {
      level: 1,
      title: "Routine Consistency",
      detail: "Completed a routine for 3 days",
    },
  },
  {
    match: "Build a 3-day streak",
    check: ({ streak }) => streak >= 3,
    point: {
      level: 1,
      title: "3-Day Streak",
      detail: "3 days of all tasks completed",
    },
  },
  {
    match: "Unlock your second routine",
    check: ({ routines }) => routines.filter((r) => r.unlocked).length >= 2,
    point: {
      level: 1,
      title: "Routine Unlocked",
      detail: "Unlocked 2 routines",
    },
  },
  {
    match: "Stretch 3 days in a row",
    check: ({ routines }) =>
      routines.some((r) => r.name === "Stretching" && r.streak >= 3),
    point: {
      level: 1,
      title: "Stretch Champion",
      detail: "Did stretching 3 days in a row",
    },
  },
  {
    match: "Drink water for 3 days in a row",
    check: ({ routines }) =>
      routines.some((r) => r.name === "Drink Water" && r.streak >= 3),
    point: {
      level: 1,
      title: "Hydration Hero",
      detail: "Drank water for 3 days",
    },
  },
  {
    match: "Complete 5 tasks in one day",
    check: ({ tasks }) => tasks.filter((t) => t.completed).length >= 5,
    point: {
      level: 2,
      title: "Heavy Task Day",
      detail: "Completed 5+ tasks in one day",
    },
  },
  {
    match: "Maintain a level 2 routine",
    check: ({ routines }) =>
      routines.some((r) => r.level >= 2 && r.streak >= 3),
    point: {
      level: 2,
      title: "Advanced Routine",
      detail: "Maintained a level 2 routine",
    },
  },
  {
    match: "Be consistent for 7 days",
    check: ({ streak }) => streak >= 7,
    point: {
      level: 2,
      title: "7-Day Streak",
      detail: "Stayed consistent for 7 days",
    },
  },
  {
    match: "Unlock a level 3 routine",
    check: ({ routines }) => routines.some((r) => r.level >= 3 && r.unlocked),
    point: {
      level: 2,
      title: "Routine Mastery",
      detail: "Unlocked a level 3 routine",
    },
  },
  {
    match: "Start a new routine",
    check: ({ routines }) => routines.length >= 1,
    point: {
      level: 1,
      title: "Routine Beginner",
      detail: "Started a new routine",
    },
  },
  {
    match: "Keep your garden green for 5 days",
    check: ({ gardenDays }) => gardenDays >= 5,
    point: {
      level: 2,
      title: "Garden Keeper",
      detail: "Kept your garden growing for 5 days",
    },
  },
  {
    match: "Complete all tasks for 3 days",
    check: ({ dailyTaskCompletions }) => dailyTaskCompletions >= 3,
    point: {
      level: 2,
      title: "Task Pro",
      detail: "3 full days of tasks completed",
    },
  },
  {
    match: "Wake up early 3 days in a row",
    check: ({ routines }) =>
      routines.some((r) => r.name === "Wake up early" && r.streak >= 3),
    point: {
      level: 1,
      title: "Early Riser",
      detail: "Woke up early 3 days in a row",
    },
  },
  {
    match: "Finish all your routines in one day",
    check: ({ routines }) =>
      routines.length > 0 && routines.every((r) => r.doneToday),
    point: {
      level: 2,
      title: "Routine Perfection",
      detail: "Completed all routines today",
    },
  },
  {
    match: "Reach a 5-day streak",
    check: ({ streak }) => streak >= 5,
    point: {
      level: 3,
      title: "5-Day Streak",
      detail: "Completed all tasks for 5 days in a row",
    },
  },
];
