import { useLiveQuery } from "@tanstack/react-db"
import { format, getDay, getDaysInMonth, startOfMonth } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import {
  dateKey,
  HEATMAP_LEVEL_COLORS,
  heatmapColorFor,
  isScheduledOn,
} from "@/lib/habits"
import { cn } from "@/lib/utils"

const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CheckinsCalendarCard() {
  const { data: habits = [] } = useLiveQuery({
    query: (q) => q.from({ habit: habitsCollection }),
  })
  const { data: checkins = [] } = useLiveQuery({
    query: (q) => q.from({ checkin: checkinsCollection }),
  })
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

  return (
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
  )
}
