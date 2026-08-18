import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"

import { listCircles } from "@/actions/circles"
import type { CircleMember } from "@/actions/circles"
import { collectionsQueryClient, persistence } from "@/lib/db/browser"

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

export const circlesCollection = createCollection(
  persistedCollectionOptions<CircleRecord, string>({
    ...queryCollectionOptions({
      id: "circles",
      queryKey: ["circles"],
      queryClient: collectionsQueryClient,
      getKey: (circle) => circle.id,
      queryFn: () => listCircles(),
    }),
    persistence,
    schemaVersion: 2,
  }),
)
