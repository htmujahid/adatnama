import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"
import type { QueryClient } from "@tanstack/query-core"
import { queryOptions } from "@tanstack/react-query"

import {
  createCircle,
  leaveCircle,
  listCircles,
  previewCircleByCode,
  removeMember,
  updateCircle,
  updateMemberRole,
} from "@/actions/circles"
import type { CircleMember } from "@/actions/circles"
import { getPersistedCollection } from "@/lib/data/collection"

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

export function getCirclesCollection(queryClient: QueryClient) {
  return getPersistedCollection<CircleRecord, string>({
    id: "circles",
    schemaVersion: 2,
    queryKey: ["circles"],
    queryClient,
    getKey: (circle) => circle.id,
    queryFn: () => listCircles(),
  })
}

type CirclesCollection = Awaited<ReturnType<typeof getCirclesCollection>>

export const circleMutationFns: OfflineConfig["mutationFns"] = {
  "circles.create": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CirclesCollection
    const modified = mutation.modified as unknown as CircleRecord
    const result = await createCircle({
      data: {
        name: modified.name,
        description: modified.description,
        color: modified.color,
      },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeInsert({
      id: result.circle.id,
      name: result.circle.name,
      slug: result.circle.slug,
      description: result.circle.description,
      color: result.circle.color,
      joinCode: result.circle.joinCode,
      members: modified.members,
    })
  },
  "circles.update": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CirclesCollection
    const modified = mutation.modified as unknown as CircleRecord
    const result = await updateCircle({
      data: {
        organizationId: mutation.key as string,
        name: modified.name,
        description: modified.description,
        color: modified.color,
      },
    })
    if (result.error || !result.circle) {
      throw new NonRetriableError(result.error?.message ?? "Update failed.")
    }
    collection.utils.writeUpdate({
      id: result.circle.id,
      name: result.circle.name,
      slug: result.circle.slug,
      description: result.circle.description,
      color: result.circle.color,
      joinCode: result.circle.joinCode,
      members: modified.members,
    })
  },
  "circles.leave": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CirclesCollection
    const result = await leaveCircle({
      data: { organizationId: mutation.key as string },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeDelete(mutation.key as string)
  },
  "circles.updateMemberRole": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CirclesCollection
    const modified = mutation.modified as unknown as CircleRecord
    const meta = mutation.metadata as { memberId: string; role: string }
    const result = await updateMemberRole({
      data: {
        organizationId: mutation.key as string,
        memberId: meta.memberId,
        role: meta.role as "admin" | "member",
      },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeUpdate(modified)
  },
  "circles.removeMember": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CirclesCollection
    const modified = mutation.modified as unknown as CircleRecord
    const meta = mutation.metadata as { memberId: string }
    const result = await removeMember({
      data: {
        organizationId: mutation.key as string,
        memberId: meta.memberId,
      },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeUpdate(modified)
  },
}

export const circlePreviewQueryOptions = (code: string) =>
  queryOptions({
    queryKey: ["circles", "preview", code],
    queryFn: () => previewCircleByCode({ data: { code } }),
  })
