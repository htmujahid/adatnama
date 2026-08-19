import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import type { QueryClient } from "@tanstack/react-query"

import { listCheckins } from "@/actions/checkins"
import type { CheckinStatus } from "@/actions/checkins"
import { db } from "@/lib/db/browser"
import type { HabitCheckinTable } from "@/lib/db/schema"

export type CheckinRecord = Omit<HabitCheckinTable, "status"> & {
  status: CheckinStatus
}

export const checkinsCollectionOptions = collectionOptions(
  "checkins",
  (client) =>
    persistedCollectionOptions<CheckinRecord, string>({
      ...queryCollectionOptions({
        id: "checkins",
        queryKey: ["checkins"],
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        getKey: (checkin) => checkin.id,
        queryFn: () => listCheckins() as Promise<Array<CheckinRecord>>,
      }),
      persistence:
        client.requireDependency<PersistedCollectionPersistence>("persistence"),
      schemaVersion: 1,
    }),
)

export const checkinsCollection = db.collection(checkinsCollectionOptions)
