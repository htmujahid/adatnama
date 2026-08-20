import type {
  CircleHabitsPayload,
  CircleSharedHabitRow,
} from "@/actions/circle-habits"
import { computeHabitStats } from "@/lib/habits"
import type { HabitStats } from "@/lib/habits"

export type CircleSharedHabit = CircleSharedHabitRow &
  HabitStats & { days: Array<number> }

export type CircleMemberHabits = {
  ownerUserId: string
  ownerName: string
  memberSince: string
  habits: Array<CircleSharedHabit>
}

const EMPTY_DONE_DATES: ReadonlySet<string> = new Set()

export function groupCircleHabits(
  payload: CircleHabitsPayload,
  today: Date,
): Array<CircleMemberHabits> {
  const daysByHabitId = new Map<string, Array<number>>()
  for (const day of payload.days) {
    let days = daysByHabitId.get(day.habitId)
    if (!days) {
      days = []
      daysByHabitId.set(day.habitId, days)
    }
    days.push(day.dayOfWeek)
  }

  const doneDatesByHabitId = new Map<string, Set<string>>()
  for (const checkin of payload.checkins) {
    let dates = doneDatesByHabitId.get(checkin.habitId)
    if (!dates) {
      dates = new Set()
      doneDatesByHabitId.set(checkin.habitId, dates)
    }
    dates.add(checkin.date)
  }

  const membersByUserId = new Map<string, CircleMemberHabits>()
  for (const row of payload.habits) {
    const days = daysByHabitId.get(row.id) ?? []
    const habit: CircleSharedHabit = {
      ...row,
      days,
      ...computeHabitStats(
        { days, freezesTotal: row.freezesTotal, startedAt: row.startedAt },
        doneDatesByHabitId.get(row.id) ?? EMPTY_DONE_DATES,
        today,
      ),
    }
    let member = membersByUserId.get(row.userId)
    if (!member) {
      member = {
        ownerUserId: row.userId,
        ownerName: row.ownerName,
        memberSince: row.memberSince,
        habits: [],
      }
      membersByUserId.set(row.userId, member)
    }
    member.habits.push(habit)
  }

  const members = Array.from(membersByUserId.values())
  for (const member of members) {
    member.habits.sort((a, b) => a.sharedAt.localeCompare(b.sharedAt))
  }
  members.sort((a, b) => a.memberSince.localeCompare(b.memberSince))
  return members
}
