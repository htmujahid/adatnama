import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"

import { listCheckins } from "@/actions/checkins"
import type { CheckinStatus } from "@/actions/checkins"
import { collectionsQueryClient, persistence } from "@/lib/db/browser"
import type { HabitCheckinTable } from "@/lib/db/schema"

export type CheckinRecord = Omit<HabitCheckinTable, "status"> & {
  status: CheckinStatus
}

export const checkinsCollection = createCollection(
  persistedCollectionOptions<CheckinRecord, string>({
    ...queryCollectionOptions({
      id: "checkins",
      queryKey: ["checkins"],
      queryClient: collectionsQueryClient,
      getKey: (checkin) => checkin.id,
      queryFn: () => listCheckins() as Promise<Array<CheckinRecord>>,
    }),
    persistence,
    schemaVersion: 1,
  }),
)
