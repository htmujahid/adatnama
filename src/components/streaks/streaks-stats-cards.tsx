import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { FlameIcon, TrophyIcon } from "lucide-react"

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
import { habitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"

export function StreaksStatsCards() {
  const { data: rows = [], isLoading } = useLiveQuery((q) =>
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
      .where(({ habit }) => isNull(habit.archivedAt)),
  )
  const habits = foldHabitCheckinRows(rows, new Date())

  const streaks = [...habits].sort(
    (a, b) => b.streak - a.streak || b.longestStreak - a.longestStreak,
  )
  const activeCount = streaks.filter((habit) => habit.streak > 0).length
  const longestCurrent = streaks.at(0)
  const longestEver = [...streaks]
    .sort((a, b) => b.longestStreak - a.longestStreak)
    .at(0)

  const stats = [
    {
      label: "Active streaks",
      value: `${activeCount} of ${streaks.length} habits`,
      badge: `${streaks.length - activeCount} broken`,
      icon: FlameIcon,
    },
    {
      label: "Longest current streak",
      value: longestCurrent ? `${longestCurrent.streak} days` : "—",
      badge: longestCurrent?.name ?? "No habits yet",
      icon: FlameIcon,
    },
    {
      label: "Longest streak ever",
      value: longestEver ? `${longestEver.longestStreak} days` : "—",
      badge: longestEver?.name ?? "No habits yet",
      icon: TrophyIcon,
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {isLoading ? <Skeleton className="h-8 w-24" /> : stat.value}
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
