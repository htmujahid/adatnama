import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  parseISO,
  subDays,
} from "date-fns"

import type { HabitRow } from "@/actions/habits"

export type HabitDayState = "done" | "missed" | "frozen" | "today"

export const WEEKDAYS = [
  { value: 0, short: "Sun", label: "Sunday" },
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
] as const

export const HABIT_DAY_PRESETS = [
  { id: "daily", label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { id: "weekdays", label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { id: "weekends", label: "Weekends", days: [0, 6] },
] as const

export type SchedulePresetId = (typeof HABIT_DAY_PRESETS)[number]["id"]

export function schedulePresetFor(
  days: ReadonlyArray<number>,
): SchedulePresetId | undefined {
  return HABIT_DAY_PRESETS.find(
    (preset) =>
      preset.days.length === days.length &&
      preset.days.every((day) => days.includes(day)),
  )?.id
}

export function formatHabitDays(days: ReadonlyArray<number>): string {
  const preset = HABIT_DAY_PRESETS.find(
    (candidate) => candidate.id === schedulePresetFor(days),
  )
  if (preset) return preset.label
  return days
    .toSorted((a, b) => a - b)
    .map((day) => WEEKDAYS[day].short)
    .join(", ")
}

export const HEATMAP_LEVEL_COLORS = [
  "var(--muted)",
  "color-mix(in oklch, var(--primary) 20%, var(--muted))",
  "color-mix(in oklch, var(--primary) 40%, var(--muted))",
  "color-mix(in oklch, var(--primary) 60%, var(--muted))",
  "color-mix(in oklch, var(--primary) 80%, var(--muted))",
  "var(--primary)",
] as const

export function heatmapLevelFor(done: number, scheduled: number): number {
  if (done === 0) return 0
  const ratio = scheduled > 0 ? done / scheduled : 1
  return Math.max(1, Math.min(5, Math.round(ratio * 5)))
}

export function heatmapColorFor(done: number, scheduled: number): string {
  return HEATMAP_LEVEL_COLORS[heatmapLevelFor(done, scheduled)]
}

export function dateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function lastNDays(count: number, today: Date): Array<Date> {
  return eachDayOfInterval({ start: subDays(today, count - 1), end: today })
}

export function reminderMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time)
  if (!match) return Number.POSITIVE_INFINITY
  return Number(match[1]) * 60 + Number(match[2])
}

export const WEEK_LENGTH = 7
export const HISTORY_LENGTH = 28

export type HabitView = HabitRow & HabitStats

export type HabitStats = {
  doneToday: boolean
  streak: number
  longestStreak: number
  freezesLeft: number
  startedDaysAgo: number
  week: Array<HabitDayState>
  history: Array<HabitDayState>
}

type ScheduledHabit = {
  days: ReadonlyArray<number>
  freezesTotal: number
  startedAt: string
}

export function isScheduledOn(habit: ScheduledHabit, date: Date): boolean {
  return habit.days.includes(getDay(date))
}

type DoneCheckin = { habitId: string; date: string; status: string }

export function doneDatesByHabitId(
  checkins: ReadonlyArray<DoneCheckin>,
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const checkin of checkins) {
    if (checkin.status !== "done") continue
    let dates = map.get(checkin.habitId)
    if (!dates) {
      dates = new Set()
      map.set(checkin.habitId, dates)
    }
    dates.add(checkin.date)
  }
  return map
}

const EMPTY_DONE_DATES: ReadonlySet<string> = new Set()

export function foldHabitCheckinRows<T extends ScheduledHabit & { id: string }>(
  rows: ReadonlyArray<{
    habit: T
    checkin: { date: string } | null | undefined
  }>,
  today: Date,
): Array<T & HabitStats> {
  const habitById = new Map<string, T>()
  const doneDates = new Map<string, Set<string>>()
  for (const { habit, checkin } of rows) {
    habitById.set(habit.id, habit)
    if (!checkin) continue
    let dates = doneDates.get(habit.id)
    if (!dates) {
      dates = new Set()
      doneDates.set(habit.id, dates)
    }
    dates.add(checkin.date)
  }
  return Array.from(habitById.values(), (record) => ({
    ...record,
    ...computeHabitStats(
      record,
      doneDates.get(record.id) ?? EMPTY_DONE_DATES,
      today,
    ),
  }))
}

export function computeHabitStats(
  habit: ScheduledHabit,
  doneDates: ReadonlySet<string>,
  today: Date,
): HabitStats {
  const started = parseISO(habit.startedAt)
  const start = started > today ? today : started
  const frozenDates = new Set<string>()

  let streak = 0
  let longestStreak = 0
  let freezesUsed = 0

  for (const day of eachDayOfInterval({ start, end: today })) {
    const key = dateKey(day)
    if (doneDates.has(key)) {
      streak += 1
      longestStreak = Math.max(longestStreak, streak)
    } else if (isScheduledOn(habit, day) && !isSameDay(day, today)) {
      if (streak > 0 && freezesUsed < habit.freezesTotal) {
        freezesUsed += 1
        frozenDates.add(key)
      } else {
        streak = 0
        freezesUsed = 0
      }
    }
  }

  const stateFor = (day: Date): HabitDayState => {
    const key = dateKey(day)
    if (doneDates.has(key)) return "done"
    if (isSameDay(day, today)) return "today"
    if (frozenDates.has(key)) return "frozen"
    return "missed"
  }

  return {
    doneToday: doneDates.has(dateKey(today)),
    streak,
    longestStreak,
    freezesLeft:
      streak > 0 ? habit.freezesTotal - freezesUsed : habit.freezesTotal,
    startedDaysAgo: Math.max(0, differenceInCalendarDays(today, started)),
    week: lastNDays(WEEK_LENGTH, today).map(stateFor),
    history: lastNDays(HISTORY_LENGTH, today).map(stateFor),
  }
}
