import { queryOptions } from "@tanstack/react-query"

import { listCircleHabits, listHabitShares } from "@/actions/circle-habits"
import { previewCircleByCode } from "@/actions/circles"

export const circlePreviewQueryOptions = (code: string) =>
  queryOptions({
    queryKey: ["circles", "preview", code],
    queryFn: () => previewCircleByCode({ data: { code } }),
  })

export const circleHabitsQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: ["circles", "habits", organizationId],
    queryFn: async () => {
      const { error, members } = await listCircleHabits({
        data: { organizationId },
      })
      if (error) {
        throw new Error(error.message)
      }
      return members
    },
  })

export const habitSharesQueryOptions = (habitId: string) =>
  queryOptions({
    queryKey: ["circles", "habit-shares", habitId],
    queryFn: () => listHabitShares({ data: { habitId } }),
  })
