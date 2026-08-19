import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { listCircles } from "@/actions/circles"
import type { CircleMember } from "@/actions/circles"
import { persistence } from "@/lib/db/browser"

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

export const circlesCollection = collectionOptions("circles", (client) =>
  persistedCollectionOptions<CircleRecord, string>({
    ...queryCollectionOptions({
      id: "circles",
      queryKey: ["circles"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (circle) => circle.id,
      queryFn: () => listCircles(),
    }),
    persistence,
    schemaVersion: 2,
  }),
)

export function useCirclesCollection() {
  return useDbClient().collection(circlesCollection)
}

export type CirclesCollection = ReturnType<typeof useCirclesCollection>
