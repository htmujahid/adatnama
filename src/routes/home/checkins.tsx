import { useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import {
  differenceInCalendarDays,
  format,
  getDay,
  getDaysInMonth,
  startOfMonth,
} from "date-fns"
import {
  CalendarCheckIcon,
  CircleCheckIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import {
  dateKey,
  HEATMAP_LEVEL_COLORS,
  heatmapColorFor,
  isScheduledOn,
  lastNDays,
} from "@/lib/habits"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/home/checkins")({
  component: CheckInsPage,
})

const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function CheckInsPage() {
  const { data: habits = [], isLoading: habitsLoading } = useLiveQuery((q) =>
    q.from({ habit: habitsCollection }),
  )
  const { data: checkins = [], isLoading: checkinsLoading } = useLiveQuery(
    (q) => q.from({ checkin: checkinsCollection }),
  )
  const isLoading = habitsLoading || checkinsLoading
  const activeHabits = habits.filter((habit) => habit.archivedAt === null)

  const today = new Date()
  const monthLabel = format(today, "MMMM yyyy")
  const monthStart = startOfMonth(today)
  const daysInMonth = getDaysInMonth(today)
  const firstWeekday = getDay(monthStart)
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

  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1
    const inMonth = day >= 1 && day <= daysInMonth
    const isFuture = inMonth && day > todayDayOfMonth
    const isToday = inMonth && day === todayDayOfMonth
    const date = inMonth
      ? new Date(today.getFullYear(), today.getMonth(), day)
      : null
    const tracked = date !== null && !isFuture
    const count = tracked ? (doneCountByDate.get(dateKey(date)) ?? 0) : null
    const scheduled = tracked ? scheduledCountOn(date) : null

    return {
      key: `cell-${index}`,
      day: inMonth ? day : null,
      inMonth,
      isToday,
      isFuture,
      count,
      scheduled,
    }
  })

  const trackedDays = calendarCells.filter(
    (cell) => cell.inMonth && !cell.isFuture,
  )
  const checkinsThisMonth = trackedDays.reduce(
    (sum, cell) => sum + (cell.count ?? 0),
    0,
  )
  const scheduledThisMonth = trackedDays.reduce(
    (sum, cell) => sum + (cell.scheduled ?? 0),
    0,
  )
  const perfectDays = trackedDays.filter(
    (cell) =>
      (cell.scheduled ?? 0) > 0 && (cell.count ?? 0) >= (cell.scheduled ?? 0),
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

  const weekDateKeys = lastNDays(7, today).map(dateKey)
  const habitNameById = new Map(habits.map((habit) => [habit.id, habit.name]))
  const weekActivity = checkins
    .filter(
      (checkin) =>
        checkin.status === "done" && weekDateKeys.includes(checkin.date),
    )
    .map((checkin) => {
      const daysAgo = differenceInCalendarDays(
        today,
        new Date(`${checkin.date}T00:00:00`),
      )
      const label =
        daysAgo === 0
          ? "Today"
          : daysAgo === 1
            ? "Yesterday"
            : format(new Date(`${checkin.date}T00:00:00`), "MMM d")
      return {
        id: checkin.id,
        habit: habitNameById.get(checkin.habitId) ?? "Habit",
        daysAgo,
        label,
      }
    })
    .sort((a, b) => a.daysAgo - b.daysAgo || a.habit.localeCompare(b.habit))

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Check-ins
        </h1>
        <p className="text-sm text-muted-foreground">
          A log of every habit you've checked off.
        </p>
      </div>

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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{monthLabel}</CardTitle>
            <CardDescription>Habits completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5 pb-1 text-center text-xs font-medium text-muted-foreground">
              {CALENDAR_WEEKDAYS.map((weekday) => (
                <div key={weekday}>{weekday}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell) => {
                const tracked = cell.inMonth && !cell.isFuture
                const ratio =
                  tracked && (cell.scheduled ?? 0) > 0
                    ? (cell.count ?? 0) / (cell.scheduled ?? 1)
                    : 0
                return (
                  <div
                    key={cell.key}
                    title={
                      tracked
                        ? `${format(today, "MMM")} ${cell.day} — ${cell.count} of ${cell.scheduled} habits`
                        : undefined
                    }
                    style={
                      tracked
                        ? {
                            backgroundColor: heatmapColorFor(
                              cell.count ?? 0,
                              cell.scheduled ?? 0,
                            ),
                          }
                        : undefined
                    }
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md text-xs tabular-nums",
                      cell.inMonth &&
                        cell.isFuture &&
                        "border border-dashed border-border/60",
                      cell.isToday &&
                        "ring-2 ring-primary ring-offset-1 ring-offset-card",
                      !tracked
                        ? "text-muted-foreground/50"
                        : ratio >= 0.8
                          ? "text-primary-foreground"
                          : "text-foreground",
                    )}
                  >
                    {cell.day}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
              <span>Less</span>
              {HEATMAP_LEVEL_COLORS.map((color, index) => (
                <span
                  key={index}
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This week's activity</CardTitle>
            <CardDescription>Every check-in, last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            ) : weekActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No check-ins in the last 7 days yet.
              </p>
            ) : (
              <div className="max-h-[420px] overflow-y-auto pr-1">
                <ItemGroup>
                  {weekActivity.map((event) => (
                    <Item key={event.id} variant="outline" size="sm">
                      <ItemMedia>
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CircleCheckIcon className="size-3.5" />
                        </span>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{event.habit}</ItemTitle>
                        <ItemDescription>{event.label}</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                </ItemGroup>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
