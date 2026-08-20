import { eq, useLiveQuery } from "@tanstack/react-db"
import { FlameIcon, SnowflakeIcon, TrophyIcon } from "lucide-react"

import { habitStatus, STATUS_META } from "@/components/habits/habit-status"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"

export function HabitStatsCards({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const { data: rows = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habit: habitsCollection })
        .leftJoin(
          {
            checkin: q
              .from({ checkin: checkinsCollection })
              .where(({ checkin }) => eq(checkin.status, "done")),
          },
          ({ habit, checkin }) => eq(checkin.habitId, habit.id),
        )
        .where(({ habit }) => eq(habit.id, habitId)),
  })
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)

  if (isLoading && !habit) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1.5 h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!habit) {
    return null
  }

  const statusMeta = STATUS_META[habitStatus(habit)]

  const stats = [
    {
      label: "Current streak",
      value: `${habit.streak} days`,
      badge: statusMeta.label,
      icon: FlameIcon,
    },
    {
      label: "Best streak",
      value: `${habit.longestStreak} days`,
      badge: "All time",
      icon: TrophyIcon,
    },
    {
      label: "Freezes left",
      value: `${habit.freezesLeft} of ${habit.freezesTotal}`,
      badge: "Available",
      icon: SnowflakeIcon,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant="secondary">
                <stat.icon />
                {stat.badge}
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
