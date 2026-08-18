import { createFileRoute, Link } from "@tanstack/react-router"
import {
  BellIcon,
  CalendarDaysIcon,
  CircleCheckIcon,
  CircleXIcon,
  FlameIcon,
  ListChecksIcon,
  MedalIcon,
  PencilIcon,
  RepeatIcon,
  SnowflakeIcon,
  TargetIcon,
  TriangleAlertIcon,
  TrophyIcon,
} from "lucide-react"

import { HabitNoteButton } from "@/components/habits/habit-note-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useHabit } from "@/hooks/use-habit-catalog"
import {
  isHabitDone,
  toggleHabitCheckIn,
  useHabitCheckInNote,
  useHabitCheckInOverrides,
} from "@/hooks/use-habit-checkins"
import { cn } from "@/lib/utils"

import type { HistoryState } from "../../-data"

export const Route = createFileRoute("/home/habits/$habitId/")({
  component: HabitDetailPage,
})

const MILESTONES = [7, 30, 100] as const

// Same 7-day window as -data.ts's `week` (and Check-ins' "This week's
// activity"), so every page agrees on which date is "today".
const WEEK_DATES = [
  "Aug 11",
  "Aug 12",
  "Aug 13",
  "Aug 14",
  "Aug 15",
  "Aug 16",
  "Aug 17",
]

const HISTORY_LEGEND = [
  { state: "done", label: "Done", className: "bg-primary" },
  { state: "frozen", label: "Frozen", className: "bg-sky-400 dark:bg-sky-500" },
  { state: "missed", label: "Missed", className: "bg-muted" },
] as const

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
            "size-3 rounded-sm",
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

function HabitDetailPage() {
  const { habitId } = Route.useParams()
  const overrides = useHabitCheckInOverrides()
  const habit = useHabit(habitId)
  const note = useHabitCheckInNote(habitId)

  if (!habit) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Habit not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This habit doesn't exist or may have been removed.
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/habits" />}
        >
          <ListChecksIcon />
          All habits
        </Button>
      </div>
    )
  }

  const done = isHabitDone(habit, overrides)
  const status = habitStatus(habit)
  const statusMeta = STATUS_META[status]
  const weekDoneCount = habit.week.filter((day) => day === "done").length

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
      label: "This week",
      value: `${weekDoneCount} of 7`,
      badge: "Check-ins",
      icon: CalendarDaysIcon,
    },
    {
      label: "Freezes left",
      value: `${habit.freezes} of ${habit.freezesTotal}`,
      badge: "Available",
      icon: SnowflakeIcon,
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {habit.name}
            </h1>
            <Badge variant={statusMeta.badgeVariant}>
              <statusMeta.icon />
              {statusMeta.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{habit.category}</p>
          {note && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              "{note}"
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={done ? "outline" : "default"}
            size="sm"
            onClick={() => toggleHabitCheckIn(habit)}
          >
            {done ? <CircleXIcon /> : <CircleCheckIcon />}
            {done ? "Undo today's check-in" : "Mark today done"}
          </Button>
          <HabitNoteButton
            habitId={habit.id}
            habitName={habit.name}
            className="border border-input"
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/home/habits/$habitId/edit"
                params={{ habitId: habit.id }}
              />
            }
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits" />}
          >
            <ListChecksIcon />
            All habits
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>{habit.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TargetIcon className="size-3.5" />
                  Target
                </dt>
                <dd className="mt-1 text-sm font-medium">{habit.target}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <RepeatIcon className="size-3.5" />
                  Frequency
                </dt>
                <dd className="mt-1 text-sm font-medium">{habit.frequency}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BellIcon className="size-3.5" />
                  Reminder
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {habit.reminderTime ?? "No reminder"}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDaysIcon className="size-3.5" />
                  Tracking since
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {habit.startedDaysAgo} days ago
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Based on your best streak</CardDescription>
          </CardHeader>
          <CardContent>
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
                    {days} days
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>Day by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              {habit.week.map((state, index) => {
                const isToday = index === habit.week.length - 1
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {WEEK_DATES[index]}
                    </span>
                    {isToday ? (
                      <button
                        type="button"
                        onClick={() => toggleHabitCheckIn(habit)}
                        aria-pressed={done}
                        aria-label={
                          done ? "Mark today as not done" : "Mark today as done"
                        }
                        className={cn(
                          "flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors",
                          done
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground ring-2 ring-primary/40 hover:bg-muted/70",
                        )}
                      >
                        {done && <CircleCheckIcon className="size-4" />}
                      </button>
                    ) : (
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full",
                          state === "done" &&
                            "bg-primary text-primary-foreground",
                          state === "missed" &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {state === "done" && (
                          <CircleCheckIcon className="size-4" />
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Last 4 weeks</CardTitle>
                <CardDescription>Daily check-in history</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {HISTORY_LEGEND.map((item) => (
                  <span key={item.state} className="flex items-center gap-1.5">
                    <span
                      className={cn("size-2.5 rounded-sm", item.className)}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <HistoryGrid history={habit.history} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
