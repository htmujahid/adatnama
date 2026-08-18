import { useSyncExternalStore } from "react"

import type { DayState, Habit, HistoryState } from "@/routes/home/-data"
import { HABITS } from "@/routes/home/-data"

export type HabitInput = {
  name: string
  category: string
  description: string
  target: string
  days: ReadonlyArray<number>
  reminderTime: string | null
  freezesTotal: number
}

const WEEK_DAYS = 7
const HISTORY_DAYS = 28

function blankDayStates(length: number): DayState[] {
  return Array.from({ length }, (_, index) =>
    index === length - 1 ? "today" : "missed",
  )
}

function blankHistoryStates(length: number): HistoryState[] {
  return Array.from({ length }, (_, index) =>
    index === length - 1 ? "today" : "missed",
  )
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "habit"
}

function applyEdit(habit: Habit, edit: HabitInput | undefined): Habit {
  if (!edit) return habit
  return {
    ...habit,
    ...edit,
    freezes: Math.min(habit.freezes, edit.freezesTotal),
  }
}

// Session-only habit catalog layered on top of the mock data in -data.ts.
// Not persisted anywhere yet — resets on reload.
let state: {
  created: ReadonlyArray<Habit>
  edits: ReadonlyMap<string, HabitInput>
} = {
  created: [],
  edits: new Map(),
}
const listeners = new Set<() => void>()

function publish(next: typeof state) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

export function useHabitCatalog(): Habit[] {
  const { created, edits } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  )
  return [...HABITS, ...created].map((habit) =>
    applyEdit(habit, edits.get(habit.id)),
  )
}

export function useHabit(habitId: string): Habit | undefined {
  return useHabitCatalog().find((habit) => habit.id === habitId)
}

export function createHabit(input: HabitInput): Habit {
  const existingIds = new Set(
    [...HABITS, ...state.created].map((habit) => habit.id),
  )
  const base = slugify(input.name)
  let id = base
  let suffix = 2
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }

  const habit: Habit = {
    id,
    name: input.name,
    category: input.category,
    description: input.description,
    target: input.target,
    days: input.days,
    reminderTime: input.reminderTime,
    streak: 0,
    longestStreak: 0,
    freezes: input.freezesTotal,
    freezesTotal: input.freezesTotal,
    startedDaysAgo: 0,
    done: false,
    week: blankDayStates(WEEK_DAYS),
    history: blankHistoryStates(HISTORY_DAYS),
  }

  publish({ ...state, created: [...state.created, habit] })
  return habit
}

export function updateHabit(id: string, input: HabitInput) {
  publish({ ...state, edits: new Map(state.edits).set(id, input) })
}
