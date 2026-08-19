import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { listCheckins } from "@/actions/checkins"
import type { CheckinStatus } from "@/actions/checkins"
import { persistence } from "@/lib/db/browser"
import type { HabitCheckinTable } from "@/lib/db/schema"

export type CheckinRecord = Omit<HabitCheckinTable, "status"> & {
  status: CheckinStatus
}

export const checkinsCollection = collectionOptions("checkins", (client) =>
  persistedCollectionOptions<CheckinRecord, string>({
    ...queryCollectionOptions({
      id: "checkins",
      queryKey: ["checkins"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (checkin) => checkin.id,
      queryFn: () => listCheckins() as Promise<Array<CheckinRecord>>,
    }),
    persistence,
    schemaVersion: 1,
  }),
)

export function useCheckinsCollection() {
  return useDbClient().collection(checkinsCollection)
}

export type CheckinsCollection = ReturnType<typeof useCheckinsCollection>
