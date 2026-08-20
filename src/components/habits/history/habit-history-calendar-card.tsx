import { eq, useLiveQuery } from "@tanstack/react-db"
import { format, getDay, getDaysInMonth, startOfMonth } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { dateKey, heatmapColorFor, isScheduledOn } from "@/lib/habits"
import { cn } from "@/lib/utils"

const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function HabitHistoryCalendarCard({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const { data: habits = [], isLoading: habitsLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => eq(habit.id, habitId)),
  })
  const { data: checkins = [], isLoading: checkinsLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) => eq(checkin.habitId, habitId)),
  })
  const habit = habits.at(0)
  const isLoading = habitsLoading || checkinsLoading

  if (isLoading && !habit) {
    return <Skeleton className="h-80 w-full" />
  }

  if (!habit) {
    return null
  }

  const today = new Date()
  const monthLabel = format(today, "MMMM yyyy")
  const monthStart = startOfMonth(today)
  const daysInMonth = getDaysInMonth(today)
  const firstWeekday = getDay(monthStart)
  const todayDayOfMonth = today.getDate()

  const doneDates = new Set(
    checkins
      .filter((checkin) => checkin.status === "done")
      .map((checkin) => checkin.date),
  )

  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1
    const inMonth = day >= 1 && day <= daysInMonth
    const isFuture = inMonth && day > todayDayOfMonth
    const isToday = inMonth && day === todayDayOfMonth
    const date = inMonth
      ? new Date(today.getFullYear(), today.getMonth(), day)
      : null
    const tracked = date !== null && !isFuture
    const done = tracked && doneDates.has(dateKey(date))
    const scheduled = tracked && isScheduledOn(habit, date)

    return {
      key: `cell-${index}`,
      day: inMonth ? day : null,
      inMonth,
      isToday,
      isFuture,
      tracked,
      done,
      scheduled,
    }
  })

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>{monthLabel}</CardTitle>
        <CardDescription>Days this habit was checked off</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5 pb-1 text-center text-xs font-medium text-muted-foreground">
          {CALENDAR_WEEKDAYS.map((weekday) => (
            <div key={weekday}>{weekday}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map((cell) => (
            <div
              key={cell.key}
              title={
                cell.tracked
                  ? `${format(today, "MMM")} ${cell.day} — ${
                      cell.done
                        ? "Done"
                        : cell.scheduled
                          ? "Missed"
                          : "Not scheduled"
                    }`
                  : undefined
              }
              style={
                cell.tracked
                  ? {
                      backgroundColor: heatmapColorFor(
                        cell.done ? 1 : 0,
                        cell.scheduled ? 1 : 0,
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
                !cell.tracked
                  ? "text-muted-foreground/50"
                  : cell.done
                    ? "text-primary-foreground"
                    : "text-foreground",
              )}
            >
              {cell.day}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-muted" />
            Missed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-primary" />
            Done
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
