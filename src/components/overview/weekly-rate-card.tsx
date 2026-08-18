import { and, eq, inArray, isNull, useLiveQuery } from "@tanstack/react-db"
import { TrendingUpIcon } from "lucide-react"

import { StatCard } from "@/components/overview/stat-card"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import { dateKey, lastNDays, WEEK_LENGTH } from "@/lib/habits"

export function WeeklyRateCard() {
  const weekDateKeys = lastNDays(WEEK_LENGTH, new Date()).map(dateKey)
  const weekDepKey = weekDateKeys.join(",")

  const { data: activeHabits = [], isLoading: habitsLoading } = useLiveQuery(
    (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => isNull(habit.archivedAt)),
  )
  const { data: doneCheckins = [], isLoading: checkinsLoading } = useLiveQuery(
    (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) =>
          and(eq(checkin.status, "done"), inArray(checkin.date, weekDateKeys)),
        )
        .select(({ checkin }) => ({
          habitId: checkin.habitId,
          date: checkin.date,
        })),
    [weekDepKey],
  )
  const isLoading = habitsLoading || checkinsLoading

  const doneSlots = new Set(
    doneCheckins.map((checkin) => `${checkin.habitId}|${checkin.date}`),
  )
  const weeklyCheckins = activeHabits.reduce(
    (sum, habit) =>
      sum +
      weekDateKeys.filter((key) => doneSlots.has(`${habit.id}|${key}`)).length,
    0,
  )
  const weeklyRate =
    activeHabits.length > 0
      ? Math.round((weeklyCheckins / (WEEK_LENGTH * activeHabits.length)) * 100)
      : 0

  return (
    <StatCard
      label="This week"
      value={`${weeklyRate}%`}
      badge={`${weeklyCheckins} check-ins`}
      icon={TrendingUpIcon}
      isLoading={isLoading}
    />
  )
}
