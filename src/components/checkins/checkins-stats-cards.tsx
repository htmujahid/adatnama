import { useLiveQuery } from "@tanstack/react-db"
import { format, getDaysInMonth } from "date-fns"
import { CalendarCheckIcon, SparklesIcon, TargetIcon } from "lucide-react"

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
import { dateKey, isScheduledOn } from "@/lib/habits"

export function CheckinsStatsCards() {
  const { data: habits = [], isLoading: habitsLoading } = useLiveQuery({
    query: (q) => q.from({ habit: habitsCollection }),
  })
  const { data: checkins = [], isLoading: checkinsLoading } = useLiveQuery({
    query: (q) => q.from({ checkin: checkinsCollection }),
  })
  const isLoading = habitsLoading || checkinsLoading
  const activeHabits = habits.filter((habit) => habit.archivedAt === null)

  const today = new Date()
  const monthLabel = format(today, "MMMM yyyy")
  const daysInMonth = getDaysInMonth(today)
  const todayDayOfMonth = today.getDate()

  const doneCountByDate = new Map<string, number>()
  for (const checkin of checkins) {
    if (checkin.status !== "done") continue
    doneCountByDate.set(
      checkin.date,
      (doneCountByDate.get(checkin.date) ?? 0) + 1,
    )
  }

  function scheduledCountOn(date: Date): number {
    return activeHabits.filter((habit) => isScheduledOn(habit, date)).length
  }

  const trackedDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const date = new Date(today.getFullYear(), today.getMonth(), day)
    return { day, date }
  })
    .filter(({ day }) => day <= todayDayOfMonth)
    .map(({ date }) => ({
      count: doneCountByDate.get(dateKey(date)) ?? 0,
      scheduled: scheduledCountOn(date),
    }))
  const checkinsThisMonth = trackedDays.reduce(
    (sum, cell) => sum + cell.count,
    0,
  )
  const scheduledThisMonth = trackedDays.reduce(
    (sum, cell) => sum + cell.scheduled,
    0,
  )
  const perfectDays = trackedDays.filter(
    (cell) => cell.scheduled > 0 && cell.count >= cell.scheduled,
  ).length
  const monthlyRate =
    scheduledThisMonth > 0
      ? Math.round((checkinsThisMonth / scheduledThisMonth) * 100)
      : 0

  const stats = [
    {
      label: "Check-ins this month",
      value: `${checkinsThisMonth}`,
      badge: monthLabel,
      icon: CalendarCheckIcon,
    },
    {
      label: "Perfect days",
      value: `${perfectDays} of ${trackedDays.length} days`,
      badge: "All habits done",
      icon: SparklesIcon,
    },
    {
      label: "Completion rate",
      value: `${monthlyRate}%`,
      badge: "This month",
      icon: TargetIcon,
    },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {isLoading ? <Skeleton className="h-8 w-20" /> : stat.value}
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
