import { useMemo } from "react"
import { safeRandomUUID, useLiveQuery } from "@tanstack/react-db"

import { checkinsCollection } from "@/lib/collection/checkins"
import type { CheckinRecord } from "@/lib/collection/checkins"
import { useOfflineExecutor } from "@/lib/db/offline"
import { dateKey } from "@/lib/habits"

export function useHabitCheckins() {
  const executor = useOfflineExecutor()
  const { data: checkins = [], isLoading } = useLiveQuery((q) =>
    q.from({ checkin: checkinsCollection }),
  )
  const todayKey = dateKey(new Date())

  const todayByHabitId = useMemo(() => {
    const map = new Map<string, CheckinRecord>()
    for (const checkin of checkins) {
      if (checkin.date === todayKey) map.set(checkin.habitId, checkin)
    }
    return map
  }, [checkins, todayKey])

  function insertToday(
    habitId: string,
    status: "done" | "pending",
    note: string | null,
  ) {
    if (!executor) return
    const now = new Date().toISOString()
    executor
      .createOfflineTransaction({ mutationFnName: "checkins.create" })
      .mutate(() => {
        checkinsCollection.insert({
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
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "checkins.update" })
      .mutate(() => {
        checkinsCollection.update(checkin.id, (draft) => {
          Object.assign(draft, changes, {
            updatedAt: new Date().toISOString(),
          })
        })
      })
  }

  function deleteCheckin(checkin: CheckinRecord) {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "checkins.delete" })
      .mutate(() => {
        checkinsCollection.delete(checkin.id)
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
    isLoading,
    toggleCheckin,
    setCheckinNote,
  }
}

export function useHabitCheckinNote(habitId: string): string {
  const { todayByHabitId } = useHabitCheckins()
  return todayByHabitId.get(habitId)?.note ?? ""
}
