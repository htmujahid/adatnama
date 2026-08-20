import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"

import {
  archiveHabit,
  createHabit,
  deleteHabit,
  restoreHabit,
  updateHabit,
} from "@/actions/habits"
import type { HabitRow } from "@/actions/habits"
import type { CheckinsCollection } from "@/lib/collection/checkins"
import type { HabitsCollection } from "@/lib/collection/habits"

function habitInputFrom(modified: HabitRow) {
  return {
    categoryId: modified.categoryId,
    name: modified.name,
    description: modified.description,
    target: modified.target,
    reminderTime: modified.reminderTime,
    freezesTotal: modified.freezesTotal,
    days: [...modified.days],
  }
}

function habitUpdateInputFrom(modified: HabitRow) {
  return {
    categoryId: modified.categoryId,
    name: modified.name,
    description: modified.description,
    reminderTime: modified.reminderTime,
  }
}

export const habitMutationFns: OfflineConfig["mutationFns"] = {
  "habits.create": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const modified = mutation.modified as unknown as HabitRow
    const result = await createHabit({
      data: {
        id: modified.id,
        startedAt: modified.startedAt,
        ...habitInputFrom(modified),
      },
    })
    if (result.error || !result.habit) {
      throw new NonRetriableError(result.error?.message ?? "Create failed.")
    }
    collection.utils.writeInsert(result.habit)
  },
  "habits.update": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const modified = mutation.modified as unknown as HabitRow
    const result = await updateHabit({
      data: { id: String(mutation.key), ...habitUpdateInputFrom(modified) },
    })
    if (result.error || !result.habit) {
      throw new NonRetriableError(result.error?.message ?? "Update failed.")
    }
    collection.utils.writeUpdate(result.habit)
  },
  "habits.archive": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const modified = mutation.modified as unknown as HabitRow
    const result = await archiveHabit({
      data: { id: String(mutation.key), note: modified.archivedNote },
    })
    if (result.error || !result.habit) {
      throw new NonRetriableError(result.error?.message ?? "Archive failed.")
    }
    collection.utils.writeUpdate(result.habit)
  },
  "habits.restore": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const result = await restoreHabit({
      data: { id: String(mutation.key) },
    })
    if (result.error || !result.habit) {
      throw new NonRetriableError(result.error?.message ?? "Restore failed.")
    }
    collection.utils.writeUpdate(result.habit)
  },
  "habits.delete": async ({ transaction }) => {
    const habitMutation = transaction.mutations.find(
      (mutation) => mutation.collection.id === "habits",
    )
    if (!habitMutation) return
    const collection = habitMutation.collection as unknown as HabitsCollection
    const result = await deleteHabit({
      data: { id: String(habitMutation.key) },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeDelete(String(habitMutation.key))
    for (const mutation of transaction.mutations) {
      if (mutation.collection.id !== "checkins") continue
      const checkins = mutation.collection as unknown as CheckinsCollection
      checkins.utils.writeDelete(String(mutation.key))
    }
  },
}
