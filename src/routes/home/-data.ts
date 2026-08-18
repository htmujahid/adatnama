import {
  FlagIcon,
  FlameIcon,
  GemIcon,
  SparklesIcon,
  SunriseIcon,
  TargetIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"

export type DayState = "done" | "missed" | "today"
export type HistoryState = "done" | "missed" | "frozen" | "today"

export type Habit = {
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
}

export const HABIT_CATEGORIES = [
  "Fitness",
  "Learning",
  "Nutrition",
  "Mindful",
  "Wellness",
] as const

export const HABIT_FREQUENCIES = [
  "Daily",
  "Weekdays",
  "Weekends",
  "Weekly",
] as const

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
] as const satisfies ReadonlyArray<Habit>

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

const bestStreak = Math.max(...HABITS.map((habit) => habit.longestStreak))
const weeklyDoneCount = HABITS.reduce(
  (sum, habit) => sum + habit.week.filter((day) => day === "done").length,
  0,
)

function reminderMinutes(time: string) {
  const match = /^(\d+):(\d+)\s?(AM|PM)$/i.exec(time)
  if (!match) return Number.POSITIVE_INFINITY
  const hours =
    (Number(match[1]) % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0)
  return hours * 60 + Number(match[2])
}

const hasEarlyCheckIn = HABITS.some(
  (habit) =>
    habit.done &&
    habit.reminderTime !== null &&
    reminderMinutes(habit.reminderTime) < reminderMinutes("7:00 AM"),
)

// Progress/target are always populated so locked achievements can render a
// progress bar; unlockedDaysAgo is only meaningful once `unlocked` is true.
export const ACHIEVEMENTS = [
  {
    id: "first-step",
    name: "First step",
    description: "Complete your first check-in",
    icon: FlagIcon,
    unlocked: doneToday > 0,
    progress: Math.min(doneToday, 1),
    target: 1,
    unlockedDaysAgo: 90,
  },
  {
    id: "week-warrior",
    name: "Week warrior",
    description: "Hit a 7-day streak",
    icon: FlameIcon,
    unlocked: bestStreak >= 7,
    progress: Math.min(bestStreak, 7),
    target: 7,
    unlockedDaysAgo: 77,
  },
  {
    id: "consistent",
    name: "Consistent",
    description: "Score 80%+ completion in a week",
    icon: TargetIcon,
    // A historical best, not derived from the current week's rate — an
    // achievement earned once should stay earned even if this week dips.
    unlocked: true,
    progress: 1,
    target: 1,
    unlockedDaysAgo: 45,
  },
  {
    id: "team-player",
    name: "Team player",
    description: "Join a circle",
    icon: UsersIcon,
    unlocked: true,
    progress: 1,
    target: 1,
    unlockedDaysAgo: 60,
  },
  {
    id: "early-riser",
    name: "Early riser",
    description: "Complete a habit with a reminder before 7 AM",
    icon: SunriseIcon,
    unlocked: hasEarlyCheckIn,
    progress: hasEarlyCheckIn ? 1 : 0,
    target: 1,
    unlockedDaysAgo: 64,
  },
  {
    id: "month-master",
    name: "Month master",
    description: "Hit a 30-day streak",
    icon: TrophyIcon,
    unlocked: bestStreak >= 30,
    progress: Math.min(bestStreak, 30),
    target: 30,
    unlockedDaysAgo: null,
  },
  {
    id: "century-club",
    name: "Century club",
    description: "Hit a 100-day streak",
    icon: GemIcon,
    unlocked: bestStreak >= 100,
    progress: Math.min(bestStreak, 100),
    target: 100,
    unlockedDaysAgo: null,
  },
  {
    id: "perfect-week",
    name: "Perfect week",
    description: "Every habit, every day for a week",
    icon: SparklesIcon,
    unlocked: weeklyDoneCount >= 7 * HABITS.length,
    progress: weeklyDoneCount,
    target: 7 * HABITS.length,
    unlockedDaysAgo: null,
  },
] as const
