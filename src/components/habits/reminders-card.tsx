import { isNull, useLiveQuery } from "@tanstack/react-db"
import { BellIcon } from "lucide-react"

import { StatCard } from "@/components/overview/stat-card"
import { habitsCollection } from "@/lib/collection/habits"

export function RemindersCard() {
  const { data: habits = [], isLoading } = useLiveQuery((q) =>
    q
      .from({ habit: habitsCollection })
      .where(({ habit }) => isNull(habit.archivedAt)),
  )

  const reminderCount = habits.filter(
    (habit) => habit.reminderTime !== null,
  ).length

  return (
    <StatCard
      label="Reminders set"
      value={`${reminderCount} of ${habits.length}`}
      badge="Enabled"
      icon={BellIcon}
      isLoading={isLoading}
    />
  )
}
