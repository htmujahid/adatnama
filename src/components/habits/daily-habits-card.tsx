import { isNull, useLiveQuery } from "@tanstack/react-db"
import { RepeatIcon } from "lucide-react"

import { StatCard } from "@/components/overview/stat-card"
import { habitsCollection } from "@/lib/collection/habits"

export function DailyHabitsCard() {
  const { data: habits = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => isNull(habit.archivedAt)),
  })

  const dailyCount = habits.filter((habit) => habit.days.length === 7).length

  return (
    <StatCard
      label="Daily habits"
      value={`${dailyCount} of ${habits.length}`}
      badge="Every day"
      icon={RepeatIcon}
      isLoading={isLoading}
    />
  )
}
