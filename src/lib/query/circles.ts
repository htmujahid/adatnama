import { queryOptions } from "@tanstack/react-query"

import { listCircleHabits, listHabitShares } from "@/actions/circle-habits"
import type { CircleHabitsPayload } from "@/actions/circle-habits"
import { previewCircleByCode } from "@/actions/circles"
import { computeHabitStats } from "@/lib/habits"

export type CircleSharedHabit = {
  id: string
  name: string
  description: string
  target: string
  reminderTime: string | null
  days: Array<number>
  streak: number
  doneToday: boolean
}

export type CircleMemberHabits = {
  ownerUserId: string
  ownerName: string
  habits: Array<CircleSharedHabit>
}

function buildCircleMembers(
  payload: CircleHabitsPayload,
): Array<CircleMemberHabits> {
  const today = new Date()
  const daysByHabit = new Map<string, Array<number>>()
  for (const day of payload.days) {
    const days = daysByHabit.get(day.habitId) ?? []
    days.push(day.dayOfWeek)
    daysByHabit.set(day.habitId, days)
  }
  const doneDatesByHabit = new Map<string, Set<string>>()
  for (const checkin of payload.checkins) {
    const dates = doneDatesByHabit.get(checkin.habitId) ?? new Set<string>()
    dates.add(checkin.date)
    doneDatesByHabit.set(checkin.habitId, dates)
  }

  const members = new Map<
    string,
    CircleMemberHabits & { memberSince: string }
  >()
  const habits = payload.habits.toSorted((a, b) =>
    a.sharedAt.localeCompare(b.sharedAt),
  )
  for (const habit of habits) {
    let member = members.get(habit.userId)
    if (!member) {
      member = {
        ownerUserId: habit.userId,
        ownerName: habit.ownerName,
        memberSince: habit.memberSince,
        habits: [],
      }
      members.set(habit.userId, member)
    }
    const days = (daysByHabit.get(habit.id) ?? []).toSorted((a, b) => a - b)
    const stats = computeHabitStats(
      { days, freezesTotal: habit.freezesTotal, startedAt: habit.startedAt },
      doneDatesByHabit.get(habit.id) ?? new Set(),
      today,
    )
    member.habits.push({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      target: habit.target,
      reminderTime: habit.reminderTime,
      days,
      streak: stats.streak,
      doneToday: stats.doneToday,
    })
  }

  return Array.from(members.values())
    .toSorted((a, b) => a.memberSince.localeCompare(b.memberSince))
    .map(({ memberSince: _memberSince, ...member }) => member)
}

export const circlePreviewQueryOptions = (code: string) =>
  queryOptions({
    queryKey: ["circles", "preview", code],
    queryFn: () => previewCircleByCode({ data: { code } }),
  })

export const circleHabitsQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: ["circles", "habits", organizationId],
    queryFn: async () => {
      const { error, payload } = await listCircleHabits({
        data: { organizationId },
      })
      if (error) {
        throw new Error(error.message)
      }
      return buildCircleMembers(payload)
    },
  })

export const habitSharesQueryOptions = (habitId: string) =>
  queryOptions({
    queryKey: ["circles", "habit-shares", habitId],
    queryFn: () => listHabitShares({ data: { habitId } }),
  })
