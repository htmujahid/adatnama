export type DayState = "done" | "missed" | "today"
export type HistoryState = "done" | "missed" | "frozen" | "today"

export const HABITS = [
  {
    id: "morning-run",
    name: "Morning run",
    category: "Fitness",
    description: "Start the day with an easy-paced run around the block.",
    target: "5 km",
    frequency: "Daily",
    reminderTime: "6:30 AM",
    streak: 12,
    longestStreak: 18,
    freezes: 1,
    freezesTotal: 2,
    startedDaysAgo: 64,
    done: true,
    week: ["done", "done", "done", "done", "done", "done", "done"],
    // Last 4 weeks, oldest to newest. The last 7 entries match `week` above.
    history: [
      "missed",
      "missed",
      "done",
      "done",
      "done",
      "missed",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "missed",
      "frozen",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
    ],
  },
  {
    id: "read-20-pages",
    name: "Read 20 pages",
    category: "Learning",
    description: "Chip away at the reading list before bed.",
    target: "20 pages",
    frequency: "Daily",
    reminderTime: "9:00 PM",
    streak: 8,
    longestStreak: 15,
    freezes: 2,
    freezesTotal: 2,
    startedDaysAgo: 40,
    done: true,
    week: ["missed", "done", "done", "done", "done", "done", "done"],
    history: [
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "done",
      "done",
      "missed",
      "done",
      "done",
      "done",
      "missed",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "missed",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
    ],
  },
  {
    id: "drink-2l-water",
    name: "Drink 2L water",
    category: "Nutrition",
    description: "Stay hydrated throughout the day.",
    target: "2 liters",
    frequency: "Daily",
    reminderTime: null,
    streak: 21,
    longestStreak: 27,
    freezes: 0,
    freezesTotal: 2,
    startedDaysAgo: 90,
    done: true,
    week: ["done", "done", "done", "done", "done", "done", "done"],
    history: [
      "missed",
      "done",
      "done",
      "frozen",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "frozen",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
      "done",
    ],
  },
  {
    id: "no-sugar",
    name: "No sugar",
    category: "Nutrition",
    description: "Cut added sugar from meals and drinks.",
    target: "0 g added sugar",
    frequency: "Daily",
    reminderTime: null,
    streak: 3,
    longestStreak: 9,
    freezes: 1,
    freezesTotal: 2,
    startedDaysAgo: 35,
    done: true,
    week: ["missed", "missed", "missed", "done", "done", "done", "done"],
    history: [
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "frozen",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "missed",
      "missed",
      "missed",
      "done",
      "done",
      "done",
      "done",
    ],
  },
  {
    id: "meditate",
    name: "Meditate",
    category: "Mindful",
    description: "A short breathing session to start the day focused.",
    target: "10 minutes",
    frequency: "Weekdays",
    reminderTime: "7:00 AM",
    streak: 0,
    longestStreak: 5,
    freezes: 0,
    freezesTotal: 2,
    startedDaysAgo: 42,
    done: false,
    week: ["missed", "missed", "done", "missed", "missed", "missed", "today"],
    history: [
      "missed",
      "done",
      "done",
      "done",
      "done",
      "done",
      "frozen",
      "frozen",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "done",
      "missed",
      "missed",
      "missed",
      "today",
    ],
  },
] as const satisfies ReadonlyArray<{
  id: string
  name: string
  category: string
  description: string
  target: string
  frequency: string
  reminderTime: string | null
  streak: number
  longestStreak: number
  freezes: number
  freezesTotal: number
  startedDaysAgo: number
  done: boolean
  week: ReadonlyArray<DayState>
  history: ReadonlyArray<HistoryState>
}>

export const doneToday = HABITS.filter((habit) => habit.done).length

// Deterministic pseudo-random hash (no Math.random/Date.now) so generated
// activity data is identical on the server and after client hydration.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export const HEATMAP_WEEKS = 52
export const HEATMAP_DAYS = HEATMAP_WEEKS * 7

// dayIndex: 0 = oldest tracked day, HEATMAP_DAYS - 1 = today.
// Returns how many of the 5 habits were completed that day.
export function habitCountForDay(dayIndex: number) {
  const daysFromEnd = HEATMAP_DAYS - 1 - dayIndex
  // The most recent 12 days match the "Current streak" stat: fully active.
  if (daysFromEnd < 12) return 5
  // The reset just before the current streak began.
  if (daysFromEnd < 14) return 0

  // Activity trends up over the year (building the habit), with
  // deterministic day-to-day noise layered on top.
  const progress = dayIndex / HEATMAP_DAYS
  const baseline = 0.5 + progress * 0.35
  if (pseudoRandom(dayIndex) > baseline) return 0

  return 1 + Math.floor(pseudoRandom(dayIndex * 7.31 + 3.1) * 5)
}

export const HEATMAP_LEVEL_COLORS = [
  "var(--muted)",
  "color-mix(in oklch, var(--primary) 20%, var(--muted))",
  "color-mix(in oklch, var(--primary) 40%, var(--muted))",
  "color-mix(in oklch, var(--primary) 60%, var(--muted))",
  "color-mix(in oklch, var(--primary) 80%, var(--muted))",
  "var(--primary)",
] as const
