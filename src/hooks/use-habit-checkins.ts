import { useSyncExternalStore } from "react"

let state: {
  overrides: ReadonlyMap<string, boolean>
  notes: ReadonlyMap<string, string>
} = {
  overrides: new Map(),
  notes: new Map(),
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

export function useHabitCheckInOverrides() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return snapshot.overrides
}

export function useHabitCheckInNote(habitId: string): string {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return snapshot.notes.get(habitId) ?? ""
}

export function isHabitDone(
  habit: { id: string; done: boolean },
  overridesMap: ReadonlyMap<string, boolean>,
) {
  return overridesMap.get(habit.id) ?? habit.done
}

export function toggleHabitCheckIn(habit: { id: string; done: boolean }) {
  const current = state.overrides.get(habit.id) ?? habit.done
  publish({
    ...state,
    overrides: new Map(state.overrides).set(habit.id, !current),
  })
}

export function setHabitCheckInNote(habitId: string, note: string) {
  const notes = new Map(state.notes)
  if (note) {
    notes.set(habitId, note)
  } else {
    notes.delete(habitId)
  }
  publish({ ...state, notes })
}
