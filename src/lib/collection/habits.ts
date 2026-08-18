import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"

import { listHabits } from "@/actions/habits"
import type { HabitRow } from "@/actions/habits"
import { collectionsQueryClient, persistence } from "@/lib/db/browser"

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

export const habitsCollection = createCollection(
  persistedCollectionOptions<HabitRecord, string>({
    ...queryCollectionOptions({
      id: "habits",
      queryKey: ["habits"],
      queryClient: collectionsQueryClient,
      getKey: (habit) => habit.id,
      queryFn: () => listHabits(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)
