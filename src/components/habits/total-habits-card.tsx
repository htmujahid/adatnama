import { isNull, useLiveQuery } from "@tanstack/react-db"
import { ListChecksIcon } from "lucide-react"

import { StatCard } from "@/components/overview/stat-card"
import { habitsCollection } from "@/lib/collection/habits"

export function TotalHabitsCard() {
  const { data: habits = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => isNull(habit.archivedAt)),
  })

  return (
    <StatCard
      label="Total habits"
      value={`${habits.length}`}
      badge="All active"
      icon={ListChecksIcon}
      isLoading={isLoading}
    />
  )
}
