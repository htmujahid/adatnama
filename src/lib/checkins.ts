import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { safeRandomUUID } from "@tanstack/react-db"

import type {
  CheckinRecord,
  CheckinsCollection,
} from "@/lib/collection/checkins"

export type CheckinContext = {
  executor: OfflineExecutor | undefined
  collection: CheckinsCollection
  todayKey: string
}

function insertToday(
  { executor, collection, todayKey }: CheckinContext,
  habitId: string,
  status: "done" | "pending",
  note: string | null,
) {
  if (!executor) return
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

function updateExisting(
  { executor, collection }: CheckinContext,
  checkin: CheckinRecord,
  changes: Partial<Pick<CheckinRecord, "status" | "note">>,
) {
  if (!executor) return
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

function deleteExisting(
  { executor, collection }: CheckinContext,
  checkin: CheckinRecord,
) {
  if (!executor) return
  executor
    .createOfflineTransaction({ mutationFnName: "checkins.delete" })
    .mutate(() => {
      collection.delete(checkin.id)
    })
}

export function toggleCheckin(
  context: CheckinContext,
  habitId: string,
  existing: CheckinRecord | undefined,
) {
  if (!existing) {
    insertToday(context, habitId, "done", null)
  } else if (existing.status !== "done") {
    updateExisting(context, existing, { status: "done" })
  } else if (existing.note) {
    updateExisting(context, existing, { status: "pending" })
  } else {
    deleteExisting(context, existing)
  }
}

export function setCheckinNote(
  context: CheckinContext,
  habitId: string,
  existing: CheckinRecord | undefined,
  note: string,
) {
  const trimmed = note.trim()
  if (!existing) {
    if (trimmed) insertToday(context, habitId, "pending", trimmed)
  } else if (trimmed) {
    updateExisting(context, existing, { note: trimmed })
  } else if (existing.status === "pending") {
    deleteExisting(context, existing)
  } else {
    updateExisting(context, existing, { note: null })
  }
}
