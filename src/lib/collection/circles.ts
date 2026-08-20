import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import {
  listCircleHabits,
  listHabitShares,
  shareHabitToCircle,
  unshareHabitFromCircle,
} from "@/actions/circle-habits"
import type { CircleMemberHabits } from "@/actions/circle-habits"
import { listCircles, previewCircleByCode } from "@/actions/circles"
import type { CircleMember } from "@/actions/circles"
import { persistence } from "@/lib/db/browser"

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
  persistedCollectionOptions({
    ...queryCollectionOptions({
      id: "circles",
      queryKey: ["circles"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (circle: CircleRecord) => circle.id,
      queryFn: () => listCircles(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)

export function useCirclesCollection() {
  return useDbClient().collection(circlesCollection)
}

export type CirclesCollection = ReturnType<typeof useCirclesCollection>

function memoizeById<T>(create: (id: string) => T) {
  const cache = new Map<string, T>()
  return (id: string): T => {
    let value = cache.get(id)
    if (!value) {
      value = create(id)
      cache.set(id, value)
    }
    return value
  }
}

export type CirclePreviewRecord = {
  id: string
  circle: Awaited<ReturnType<typeof previewCircleByCode>>["circle"]
}

export const circlePreviewCollection = memoizeById((code: string) =>
  collectionOptions(`circle-preview-${code}`, (client) =>
    queryCollectionOptions({
      id: `circle-preview-${code}`,
      queryKey: ["circles", "preview", code],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (preview: CirclePreviewRecord) => preview.id,
      queryFn: async () => {
        const { circle } = await previewCircleByCode({ data: { code } })
        return [{ id: code, circle }]
      },
    }),
  ),
)

export const circleHabitsCollection = memoizeById((organizationId: string) =>
  collectionOptions(`circle-habits-${organizationId}`, (client) =>
    queryCollectionOptions({
      id: `circle-habits-${organizationId}`,
      queryKey: ["circles", "habits", organizationId],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (member: CircleMemberHabits) => member.ownerUserId,
      enabled: organizationId !== "",
      queryFn: async () => {
        const { error, members } = await listCircleHabits({
          data: { organizationId },
        })
        if (error) {
          throw new Error(error.message)
        }
        return members
      },
    }),
  ),
)

export type HabitShareRecord = { id: string }

export const habitSharesCollection = memoizeById((habitId: string) =>
  collectionOptions(`habit-shares-${habitId}`, (client) =>
    queryCollectionOptions({
      id: `habit-shares-${habitId}`,
      queryKey: ["circles", "habit-shares", habitId],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (share: HabitShareRecord) => share.id,
      queryFn: async () => {
        const organizationIds = await listHabitShares({ data: { habitId } })
        return organizationIds.map((organizationId) => ({ id: organizationId }))
      },
      onInsert: async ({ transaction }) => {
        const organizationId = transaction.mutations[0].modified.id
        const result = await shareHabitToCircle({
          data: { habitId, organizationId },
        })
        if (result.error) {
          throw new Error(result.error.message)
        }
      },
      onDelete: async ({ transaction }) => {
        const organizationId = transaction.mutations[0].key as string
        const result = await unshareHabitFromCircle({
          data: { habitId, organizationId },
        })
        if (result.error) {
          throw new Error(result.error.message)
        }
      },
    }),
  ),
)

export function useHabitSharesCollection(habitId: string) {
  return useDbClient().collection(habitSharesCollection(habitId))
}
