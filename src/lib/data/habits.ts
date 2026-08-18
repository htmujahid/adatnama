import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"
import type { QueryClient } from "@tanstack/query-core"

import {
  archiveHabit,
  createHabit,
  deleteHabit,
  listHabits,
  restoreHabit,
  updateHabit,
} from "@/actions/habits"
import type { HabitRow } from "@/actions/habits"
import { getPersistedCollection } from "@/lib/data/collection"

export type HabitRecord = HabitRow

export type HabitInput = {
  name: string
  description: string
  categoryId: string
  target: string
  days: ReadonlyArray<number>
  reminderTime: string | null
  freezesTotal: number
}

export function getHabitsCollection(queryClient: QueryClient) {
  return getPersistedCollection<HabitRecord, string>({
    id: "habits",
    schemaVersion: 1,
    queryKey: ["habits"],
    queryClient,
    getKey: (habit) => habit.id,
    queryFn: () => listHabits(),
  })
}

type HabitsCollection = Awaited<ReturnType<typeof getHabitsCollection>>

function habitInputFrom(modified: HabitRecord) {
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

export const habitMutationFns: OfflineConfig["mutationFns"] = {
  "habits.create": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const modified = mutation.modified as unknown as HabitRecord
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
    const modified = mutation.modified as unknown as HabitRecord
    const result = await updateHabit({
      data: { id: String(mutation.key), ...habitInputFrom(modified) },
    })
    if (result.error || !result.habit) {
      throw new NonRetriableError(result.error?.message ?? "Update failed.")
    }
    collection.utils.writeUpdate(result.habit)
  },
  "habits.archive": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const modified = mutation.modified as unknown as HabitRecord
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
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as HabitsCollection
    const result = await deleteHabit({
      data: { id: String(mutation.key) },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeDelete(String(mutation.key))
  },
}
