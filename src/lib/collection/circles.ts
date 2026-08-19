import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import type { QueryClient } from "@tanstack/react-query"

import { listCircles } from "@/actions/circles"
import type { CircleMember } from "@/actions/circles"
import { db } from "@/lib/db/browser"

export type { CircleMember } from "@/actions/circles"

export type CircleRecord = {
  id: string
  name: string
  slug: string
  description: string
  color: string
  joinCode: string
  members: Array<CircleMember>
}

export const circlesCollectionOptions = collectionOptions("circles", (client) =>
  persistedCollectionOptions<CircleRecord, string>({
    ...queryCollectionOptions({
      id: "circles",
      queryKey: ["circles"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (circle) => circle.id,
      queryFn: () => listCircles(),
    }),
    persistence:
      client.requireDependency<PersistedCollectionPersistence>("persistence"),
    schemaVersion: 2,
  }),
)

export const circlesCollection = db.collection(circlesCollectionOptions)
