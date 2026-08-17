import { createFileRoute } from "@tanstack/react-router"
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
import { cn } from "@/lib/utils"

import {
  habitCountForDay,
  HABITS,
  HEATMAP_DAYS,
  HEATMAP_LEVEL_COLORS,
} from "./-data"

export const Route = createFileRoute("/home/checkins")({
  component: CheckInsPage,
})

const MONTH_LABEL = "August 2026"
const DAYS_IN_MONTH = 31
// Aug 1, 2026 is a Saturday. Sun = 0 ... Sat = 6.
const FIRST_WEEKDAY = 6
const TODAY_DAY_OF_MONTH = 17
const CALENDAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CALENDAR_CELLS = Array.from({ length: 42 }, (_, index) => {
  const day = index - FIRST_WEEKDAY + 1
  const inMonth = day >= 1 && day <= DAYS_IN_MONTH
  const isFuture = inMonth && day > TODAY_DAY_OF_MONTH
  const isToday = day === TODAY_DAY_OF_MONTH
  const count =
    inMonth && !isFuture
      ? habitCountForDay(HEATMAP_DAYS - 1 - (TODAY_DAY_OF_MONTH - day))
      : null

  return {
    key: `cell-${index}`,
    day: inMonth ? day : null,
    inMonth,
    isToday,
    isFuture,
    count,
  }
})

const trackedDays = CALENDAR_CELLS.filter(
  (cell) => cell.inMonth && !cell.isFuture,
)
const checkinsThisMonth = trackedDays.reduce(
  (sum, cell) => sum + (cell.count ?? 0),
  0,
)
const perfectDays = trackedDays.filter(
  (cell) => cell.count === HABITS.length,
).length
const monthlyRate = Math.round(
  (checkinsThisMonth / (trackedDays.length * HABITS.length)) * 100,
)

const CHECKIN_STATS = [
  {
    label: "Check-ins this month",
    value: `${checkinsThisMonth}`,
    badge: MONTH_LABEL,
    icon: CalendarCheckIcon,
  },
  {
    label: "Perfect days",
    value: `${perfectDays} of ${trackedDays.length} days`,
    badge: "All 5 habits",
    icon: SparklesIcon,
  },
  {
    label: "Completion rate",
    value: `${monthlyRate}%`,
    badge: "This month",
    icon: TargetIcon,
  },
] as const

// "This week's activity" is derived from each habit's `week` array in
// -data.ts, so it always agrees with Overview's Today's habits list.
const WEEK_DATES = [
  "Aug 11",
  "Aug 12",
  "Aug 13",
  "Aug 14",
  "Aug 15",
  "Aug 16",
  "Aug 17",
]

const WEEK_ACTIVITY = HABITS.flatMap((habit) =>
  habit.week
    .map((state, index) => ({ state, index }))
    .filter((entry) => entry.state === "done")
    .map((entry) => {
      const daysAgo = 6 - entry.index
      const label =
        daysAgo === 0
          ? "Today"
          : daysAgo === 1
            ? "Yesterday"
            : WEEK_DATES[entry.index]
      return { habit: habit.name, daysAgo, label }
    }),
).sort((a, b) => a.daysAgo - b.daysAgo || a.habit.localeCompare(b.habit))

function calendarTextClass(count: number | null) {
  if (count === null) return "text-muted-foreground/50"
  return count >= 4 ? "text-primary-foreground" : "text-foreground"
}

function CheckInsPage() {
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
        {CHECKIN_STATS.map((stat) => (
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{MONTH_LABEL}</CardTitle>
            <CardDescription>Habits completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1.5 pb-1 text-center text-xs font-medium text-muted-foreground">
              {CALENDAR_WEEKDAYS.map((weekday) => (
                <div key={weekday}>{weekday}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {CALENDAR_CELLS.map((cell) => (
                <div
                  key={cell.key}
                  title={
                    cell.inMonth && !cell.isFuture
                      ? `Aug ${cell.day} — ${cell.count} of ${HABITS.length} habits`
                      : undefined
                  }
                  style={
                    cell.inMonth && !cell.isFuture
                      ? {
                          backgroundColor:
                            HEATMAP_LEVEL_COLORS[cell.count ?? 0],
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
                    calendarTextClass(cell.count),
                  )}
                >
                  {cell.day}
                </div>
              ))}
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
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <ItemGroup>
                {WEEK_ACTIVITY.map((event) => (
                  <Item
                    key={`${event.habit}-${event.daysAgo}`}
                    variant="outline"
                    size="sm"
                  >
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
