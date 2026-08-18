import { useSyncExternalStore } from "react"

import { HABIT_CATEGORIES, HABIT_FREQUENCIES } from "@/routes/home/-data"

export type HabitDefaults = {
  category: string
  frequency: string
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

// Session-only app preferences. Not persisted anywhere yet — resets on
// reload, same as the habit catalog and circles stores.
let state: Preferences = {
  habitDefaults: {
    category: HABIT_CATEGORIES[0],
    frequency: HABIT_FREQUENCIES[0],
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
