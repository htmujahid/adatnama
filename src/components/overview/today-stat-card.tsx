import { and, eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { CalendarCheckIcon } from "lucide-react"

import { StatCard } from "@/components/overview/stat-card"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import { dateKey, isScheduledOn } from "@/lib/habits"

export function TodayStatCard() {
  const today = new Date()
  const todayKey = dateKey(today)

  const { data: todayHabits = [], isLoading: habitsLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => isNull(habit.archivedAt))
        .fn.where(({ habit }) => isScheduledOn(habit, today)),
    queryKey: [todayKey],
  })
  const { data: doneTodayCheckins = [], isLoading: checkinsLoading } =
    useLiveQuery({
      query: (q) =>
        q
          .from({ checkin: checkinsCollection })
          .where(({ checkin }) =>
            and(eq(checkin.status, "done"), eq(checkin.date, todayKey)),
          )
          .select(({ checkin }) => ({ habitId: checkin.habitId })),
    })
  const isLoading = habitsLoading || checkinsLoading

  const doneTodayHabitIds = new Set(
    doneTodayCheckins.map((checkin) => checkin.habitId),
  )
  const doneToday = todayHabits.filter((habit) =>
    doneTodayHabitIds.has(habit.id),
  ).length

  return (
    <StatCard
      label="Today"
      value={`${doneToday} of ${todayHabits.length} habits`}
      badge={`${todayHabits.length - doneToday} left`}
      icon={CalendarCheckIcon}
      isLoading={isLoading}
    />
  )
}
