import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { listHabits } from "@/actions/habits"
import type { HabitRow } from "@/actions/habits"
import { persistence } from "@/lib/db/browser"

export type HabitInput = {
  name: string
  description: string
  categoryId: string
  target: string
  days: ReadonlyArray<number>
  reminderTime: string | null
  freezesTotal: number
}

export const habitsCollection = collectionOptions("habits", (client) =>
  persistedCollectionOptions<HabitRow, string>({
    ...queryCollectionOptions({
      id: "habits",
      queryKey: ["habits"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (habit) => habit.id,
      queryFn: () => listHabits(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)

export function useHabitsCollection() {
  return useDbClient().collection(habitsCollection)
}

export type HabitsCollection = ReturnType<typeof useHabitsCollection>
