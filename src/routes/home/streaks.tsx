import { createFileRoute } from "@tanstack/react-router"
import {
  CalendarDaysIcon,
  CircleCheckIcon,
  CircleXIcon,
  FlameIcon,
  MedalIcon,
  SnowflakeIcon,
  TriangleAlertIcon,
  TrophyIcon,
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
import { cn } from "@/lib/utils"

import type { HistoryState } from "./-data"
import { HABITS } from "./-data"

export const Route = createFileRoute("/home/streaks")({
  component: StreaksPage,
})

const MILESTONES = [7, 30, 100] as const

const STREAKS = [...HABITS].sort(
  (a, b) => b.streak - a.streak || b.longestStreak - a.longestStreak,
)

function habitStatus(habit: { done: boolean; streak: number }) {
  if (habit.streak === 0) return "broken" as const
  return habit.done ? ("active" as const) : ("at-risk" as const)
}

const STATUS_META = {
  active: {
    label: "Active",
    icon: CircleCheckIcon,
    badgeVariant: "secondary" as const,
  },
  "at-risk": {
    label: "At risk",
    icon: TriangleAlertIcon,
    badgeVariant: "outline" as const,
  },
  broken: {
    label: "Broken",
    icon: CircleXIcon,
    badgeVariant: "destructive" as const,
  },
}

const activeCount = STREAKS.filter((habit) => habit.streak > 0).length
const longestCurrent = STREAKS.reduce((best, habit) =>
  habit.streak > best.streak ? habit : best,
)
const longestEver = STREAKS.reduce((best, habit) =>
  habit.longestStreak > best.longestStreak ? habit : best,
)
const STREAK_STATS = [
  {
    label: "Active streaks",
    value: `${activeCount} of ${STREAKS.length} habits`,
    badge: `${STREAKS.length - activeCount} broken`,
    icon: FlameIcon,
  },
  {
    label: "Longest current streak",
    value: `${longestCurrent.streak} days`,
    badge: longestCurrent.name,
    icon: FlameIcon,
  },
  {
    label: "Longest streak ever",
    value: `${longestEver.longestStreak} days`,
    badge: longestEver.name,
    icon: TrophyIcon,
  },
] as const

const HISTORY_LEGEND = [
  { state: "done", label: "Done", className: "bg-primary" },
  { state: "frozen", label: "Frozen", className: "bg-sky-400 dark:bg-sky-500" },
  { state: "missed", label: "Missed", className: "bg-muted" },
] as const

function HistoryGrid({ history }: { history: ReadonlyArray<HistoryState> }) {
  return (
    <div
      className="grid grid-flow-col grid-rows-7 gap-1"
      role="img"
      aria-label="Last 4 weeks of check-ins"
    >
      {history.map((state, index) => (
        <span
          key={index}
          title={state === "today" ? "Today" : state}
          className={cn(
            "size-2.5 rounded-sm",
            state === "done" && "bg-primary",
            state === "missed" && "bg-muted",
            state === "frozen" && "bg-sky-400 dark:bg-sky-500",
            state === "today" && "bg-muted ring-2 ring-primary/40",
          )}
        />
      ))}
    </div>
  )
}

function FreezePips({ total, left }: { total: number; left: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, index) => (
        <SnowflakeIcon
          key={index}
          className={cn(
            "size-3.5",
            index < left ? "text-sky-500" : "text-muted-foreground/25",
          )}
        />
      ))}
    </div>
  )
}

function StreaksPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Streaks
        </h1>
        <p className="text-sm text-muted-foreground">
          Keep your momentum going, one day at a time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STREAK_STATS.map((stat) => (
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Habit streaks</h2>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {HISTORY_LEGEND.map((item) => (
            <span key={item.state} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-sm", item.className)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {STREAKS.map((habit) => {
          const status = habitStatus(habit)
          const statusMeta = STATUS_META[status]

          return (
            <Card
              key={habit.name}
              className={cn(status === "broken" && "border-destructive/30")}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{habit.name}</CardTitle>
                    <CardDescription>{habit.category}</CardDescription>
                  </div>
                  <Badge variant={statusMeta.badgeVariant}>
                    <statusMeta.icon />
                    {statusMeta.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-end justify-between gap-2">
                  <div className="flex items-baseline gap-1.5">
                    <FlameIcon className="size-5 text-primary" />
                    <span className="text-3xl font-semibold tabular-nums">
                      {habit.streak}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      day{Number(habit.streak) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>Best: {habit.longestStreak} days</div>
                    <div className="flex items-center justify-end gap-1">
                      <CalendarDaysIcon className="size-3" />
                      Started {habit.startedDaysAgo}d ago
                    </div>
                  </div>
                </div>

                <HistoryGrid history={habit.history} />

                <div className="flex items-center justify-between">
                  <FreezePips total={habit.freezesTotal} left={habit.freezes} />
                  <span className="text-xs text-muted-foreground">
                    {habit.freezes} of {habit.freezesTotal} freezes left
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {MILESTONES.map((days) => {
                    const achieved = habit.longestStreak >= days
                    return (
                      <Badge
                        key={days}
                        variant={achieved ? "secondary" : "outline"}
                        className={cn(!achieved && "text-muted-foreground/60")}
                      >
                        <MedalIcon />
                        {days}d
                      </Badge>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
