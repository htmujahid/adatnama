import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import type { QueryClient } from "@tanstack/react-query"

import { listHabits } from "@/actions/habits"
import type { HabitRow } from "@/actions/habits"
import { db } from "@/lib/db/browser"

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

export const habitsCollectionOptions = collectionOptions("habits", (client) =>
  persistedCollectionOptions<HabitRecord, string>({
    ...queryCollectionOptions({
      id: "habits",
      queryKey: ["habits"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (habit) => habit.id,
      queryFn: () => listHabits(),
    }),
    persistence:
      client.requireDependency<PersistedCollectionPersistence>("persistence"),
    schemaVersion: 1,
  }),
)

export const habitsCollection = db.collection(habitsCollectionOptions)
