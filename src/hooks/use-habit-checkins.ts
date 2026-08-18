import { useSyncExternalStore } from "react"

// Session-only "done today" selection per habit id, layered on top of the
// mock data in -data.ts. Not persisted anywhere yet — resets on reload.
let overrides = new Map<string, boolean>()
const listeners = new Set<() => void>()

function setOverride(habitId: string, done: boolean) {
  overrides = new Map(overrides).set(habitId, done)
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return overrides
}

export function useHabitCheckInOverrides() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function isHabitDone(
  habit: { id: string; done: boolean },
  overridesMap: ReadonlyMap<string, boolean>,
) {
  return overridesMap.get(habit.id) ?? habit.done
}

export function toggleHabitCheckIn(habit: { id: string; done: boolean }) {
  const current = overrides.get(habit.id) ?? habit.done
  setOverride(habit.id, !current)
}
