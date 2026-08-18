import { useSyncExternalStore } from "react"

import { HABIT_DAY_PRESETS } from "@/routes/home/-data"

export type HabitDefaults = {
  category: string | null
  days: ReadonlyArray<number>
  freezesTotal: number
}

export type NotificationPreferences = {
  reminders: boolean
  weeklySummary: boolean
  circleActivity: boolean
}

export type Preferences = {
  habitDefaults: HabitDefaults
  notifications: NotificationPreferences
}

let state: Preferences = {
  habitDefaults: {
    category: null,
    days: HABIT_DAY_PRESETS[0].days,
    freezesTotal: 2,
  },
  notifications: {
    reminders: true,
    weeklySummary: true,
    circleActivity: false,
  },
}
const listeners = new Set<() => void>()

function publish(next: Preferences) {
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

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function updateHabitDefaults(input: HabitDefaults) {
  publish({ ...state, habitDefaults: input })
}

export function setNotificationPreference(
  key: keyof NotificationPreferences,
  value: boolean,
) {
  publish({
    ...state,
    notifications: { ...state.notifications, [key]: value },
  })
}
