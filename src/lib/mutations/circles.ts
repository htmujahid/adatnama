import { useMemo } from "react"
import { createOptimisticAction } from "@tanstack/db"
import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"
import { safeRandomUUID } from "@tanstack/react-db"

import { duplicateCircleHabit } from "@/actions/circle-habits"
import type { CircleSharedHabit } from "@/actions/circle-habits"
import {
  createCircle,
  joinCircleByCode,
  leaveCircle,
  removeMember,
  updateCircle,
  updateMemberRole,
} from "@/actions/circles"
import { useCirclesCollection } from "@/lib/collection/circles"
import type { CircleRecord, CirclesCollection } from "@/lib/collection/circles"
import { useHabitsCollection } from "@/lib/collection/habits"

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

export function useJoinCircleAction() {
  const circles = useCirclesCollection()
  return async ({ code }: { code: string }) => {
    const result = await joinCircleByCode({ data: { code } })
    if (result.error || !result.slug) {
      throw new Error(result.error?.message ?? "Unable to join circle.")
    }
    await circles.utils.refetch()
  }
}

export function useDuplicateCircleHabitAction() {
  const habits = useHabitsCollection()
  return useMemo(
    () =>
      createOptimisticAction<{
        userId: string
        habit: CircleSharedHabit
        organizationId: string
      }>({
        onMutate: ({ userId, habit }) => {
          const now = new Date().toISOString()
          habits.insert({
            id: safeRandomUUID(),
            userId,
            categoryId: null,
            name: habit.name,
            description: habit.description,
            target: habit.target,
            reminderTime: habit.reminderTime,
            freezesTotal: 0,
            days: [...habit.days],
            startedAt: now,
            archivedAt: null,
            archivedNote: null,
            sourceHabitId: habit.id,
            createdAt: now,
            updatedAt: now,
          })
        },
        mutationFn: async ({ habit, organizationId }) => {
          const result = await duplicateCircleHabit({
            data: { habitId: habit.id, organizationId },
          })
          if (result.error) {
            throw new Error(result.error.message)
          }
          await habits.utils.refetch()
          return result
        },
      }),
    [habits],
  )
}
