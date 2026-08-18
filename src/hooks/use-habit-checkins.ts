import { useMemo } from "react"
import { safeRandomUUID, useLiveQuery } from "@tanstack/react-db"

import { getCheckinsCollection } from "@/lib/data/checkins"
import type { CheckinRecord } from "@/lib/data/checkins"
import { useCollection } from "@/lib/data/collection"
import { useOfflineExecutor } from "@/lib/db/offline"
import { dateKey } from "@/lib/habits"

// Today's check-in rows keyed by habit id, plus offline-first mutations for
// toggling a habit and editing its note. A row with status "pending" only
// exists to carry a note for a habit that isn't checked off yet.
export function useHabitCheckins() {
  const collection = useCollection(getCheckinsCollection)
  const executor = useOfflineExecutor()
  const { data: checkins = [], isLoading } = useLiveQuery((q) => {
    if (!collection) return undefined
    return q.from({ checkin: collection })
  })
  const todayKey = dateKey(new Date())

  const todayByHabitId = useMemo(() => {
    const map = new Map<string, CheckinRecord>()
    for (const checkin of checkins) {
      if (checkin.date === todayKey) map.set(checkin.habitId, checkin)
    }
    return map
  }, [checkins, todayKey])

  const ready = collection !== undefined && executor !== undefined

  function insertToday(
    habitId: string,
    status: "done" | "pending",
    note: string | null,
  ) {
    if (!collection || !executor) return
    const now = new Date().toISOString()
    executor
      .createOfflineTransaction({ mutationFnName: "checkins.create" })
      .mutate(() => {
        collection.insert({
          id: safeRandomUUID(),
          habitId,
          date: todayKey,
          status,
          note,
          createdAt: now,
          updatedAt: now,
        })
      })
  }

  function updateCheckin(
    checkin: CheckinRecord,
    changes: Partial<Pick<CheckinRecord, "status" | "note">>,
  ) {
    if (!collection || !executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "checkins.update" })
      .mutate(() => {
        collection.update(checkin.id, (draft) => {
          Object.assign(draft, changes, {
            updatedAt: new Date().toISOString(),
          })
        })
      })
  }

  function deleteCheckin(checkin: CheckinRecord) {
    if (!collection || !executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "checkins.delete" })
      .mutate(() => {
        collection.delete(checkin.id)
      })
  }

  function toggleCheckin(habitId: string) {
    const existing = todayByHabitId.get(habitId)
    if (!existing) {
      insertToday(habitId, "done", null)
    } else if (existing.status !== "done") {
      updateCheckin(existing, { status: "done" })
    } else if (existing.note) {
      updateCheckin(existing, { status: "pending" })
    } else {
      deleteCheckin(existing)
    }
  }

  function setCheckinNote(habitId: string, note: string) {
    const trimmed = note.trim()
    const existing = todayByHabitId.get(habitId)
    if (!existing) {
      if (trimmed) insertToday(habitId, "pending", trimmed)
    } else if (trimmed) {
      updateCheckin(existing, { note: trimmed })
    } else if (existing.status === "pending") {
      deleteCheckin(existing)
    } else {
      updateCheckin(existing, { note: null })
    }
  }

  return {
    todayByHabitId,
    isLoading: !collection || isLoading,
    ready,
    toggleCheckin,
    setCheckinNote,
  }
}

export function useHabitCheckinNote(habitId: string): string {
  const { todayByHabitId } = useHabitCheckins()
  return todayByHabitId.get(habitId)?.note ?? ""
}
