import { BasicIndex, collectionOptions } from "@tanstack/db"
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
  categoryId: string | null
  target: string
  days: ReadonlyArray<number>
  reminderTime: string | null
  freezesTotal: number
}

export const habitsCollection = collectionOptions("habits", (client) =>
  persistedCollectionOptions({
    ...queryCollectionOptions({
      id: "habits",
      queryKey: ["habits"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (habit: HabitRow) => habit.id,
      queryFn: () => listHabits(),
    }),
    persistence,
    schemaVersion: 1,
    autoIndex: "eager",
    defaultIndexType: BasicIndex,
  }),
)

export function useHabitsCollection() {
  return useDbClient().collection(habitsCollection)
}

export type HabitsCollection = ReturnType<typeof useHabitsCollection>
