import { eq, useLiveQuery } from "@tanstack/react-db"
import { eachDayOfInterval, format, parseISO } from "date-fns"
import { CalendarCheckIcon, CalendarDaysIcon, TargetIcon } from "lucide-react"

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
import { foldHabitCheckinRows, isScheduledOn } from "@/lib/habits"

export function HabitHistorySummaryCards({ habitId }: { habitId: string }) {
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

  const today = new Date()
  const totalCheckins = rows.filter((row) => row.checkin != null).length
  const started = parseISO(habit.startedAt)
  const start = started > today ? today : started
  const scheduledDays = eachDayOfInterval({ start, end: today }).filter(
    (day) => isScheduledOn(habit, day),
  ).length
  const completionRate =
    scheduledDays > 0 ? Math.round((totalCheckins / scheduledDays) * 100) : 0

  const stats = [
    {
      label: "Total check-ins",
      value: `${totalCheckins}`,
      badge: "All time",
      icon: CalendarCheckIcon,
    },
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      badge: "Since start",
      icon: TargetIcon,
    },
    {
      label: "Tracking since",
      value: `${habit.startedDaysAgo} days`,
      badge: format(start, "MMM d, yyyy"),
      icon: CalendarDaysIcon,
    },
  ] as const

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
