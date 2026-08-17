import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CalendarCheckIcon,
  FlameIcon,
  LockIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Progress } from "@/components/ui/progress"
import { useHomeUser } from "@/hooks/use-home-user"
import { cn } from "@/lib/utils"

import type { DayState } from "./-data"
import { ACHIEVEMENTS, doneToday, HABITS } from "./-data"

export const Route = createFileRoute("/home/")({ component: HomePage })

const CIRCLES = [
  { name: "Family", members: ["A", "M", "S", "Y"], checkedIn: 3 },
  { name: "Friends", members: ["J", "K", "L", "P"], checkedIn: 2 },
  { name: "Accountability Partners", members: ["N", "Q"], checkedIn: 1 },
] as const

const strongestHabit = [...HABITS].sort((a, b) => b.streak - a.streak)[0]

// Same 7-day window as -data.ts's `week` (index 0 = 6 days ago ... index 6 =
// today), so this always agrees with Today's habits and the Streaks page.
const WEEK_DATES = [
  "Aug 11",
  "Aug 12",
  "Aug 13",
  "Aug 14",
  "Aug 15",
  "Aug 16",
  "Aug 17",
]

const WEEKLY_DAILY_COUNTS = WEEK_DATES.map((date, index) => ({
  date,
  count: HABITS.filter((habit) => habit.week[index] === "done").length,
}))

const weeklyCheckins = WEEKLY_DAILY_COUNTS.reduce(
  (sum, day) => sum + day.count,
  0,
)
const weeklyRate = Math.round(
  (weeklyCheckins / (WEEK_DATES.length * HABITS.length)) * 100,
)

const STATS = [
  {
    label: "Current streak",
    value: `${strongestHabit.streak} days`,
    badge: strongestHabit.name,
    icon: FlameIcon,
  },
  {
    label: "Today",
    value: `${doneToday} of ${HABITS.length} habits`,
    badge: `${HABITS.length - doneToday} left`,
    icon: CalendarCheckIcon,
  },
  {
    label: "This week",
    value: `${weeklyRate}%`,
    badge: `${weeklyCheckins} check-ins`,
    icon: TrendingUpIcon,
  },
  {
    label: "Level",
    value: "4",
    badge: "320 XP",
    icon: ZapIcon,
  },
] as const

function WeekDots({ week }: { week: ReadonlyArray<DayState> }) {
  return (
    <div className="flex items-center gap-1.5">
      {week.map((day, index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 rounded-full",
            day === "done" && "bg-primary",
            day === "missed" && "bg-muted",
            day === "today" && "bg-muted ring-2 ring-primary/30",
          )}
        />
      ))}
    </div>
  )
}

function HomePage() {
  const user = useHomeUser()
  const firstName = user.name.split(" ")[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here's how your habits are doing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
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
            <CardTitle>Today's habits</CardTitle>
            <CardDescription>
              {doneToday} of {HABITS.length} habits checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {HABITS.map((habit) => (
                <Item key={habit.name} variant="outline">
                  <ItemMedia>
                    <Checkbox checked={habit.done} disabled />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{habit.name}</ItemTitle>
                    <ItemDescription>
                      {habit.freezes > 0
                        ? `${habit.freezes} freeze${habit.freezes > 1 ? "s" : ""} left`
                        : "No freezes left"}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <WeekDots week={habit.week} />
                    <Badge variant={habit.done ? "secondary" : "outline"}>
                      <FlameIcon />
                      {habit.streak}
                    </Badge>
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Circles</CardTitle>
            <CardDescription>Shared streaks with your people</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {CIRCLES.map((circle) => (
                <Item key={circle.name} variant="outline" size="sm">
                  <ItemMedia>
                    <AvatarGroup>
                      {circle.members.map((initial) => (
                        <Avatar key={initial} size="sm">
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{circle.name}</ItemTitle>
                    <ItemDescription>
                      {circle.checkedIn} of {circle.members.length} checked in
                      today
                    </ItemDescription>
                    <Progress
                      value={(circle.checkedIn / circle.members.length) * 100}
                      className="mt-1"
                    />
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {
                ACHIEVEMENTS.filter((achievement) => achievement.unlocked)
                  .length
              }{" "}
              of {ACHIEVEMENTS.length} unlocked
            </CardDescription>
            <CardAction>
              <Link
                to="/home/achievements"
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="min-w-0 overflow-x-auto">
              <div className="flex gap-3 pb-1">
                {ACHIEVEMENTS.map((achievement) => (
                  <div
                    key={achievement.id}
                    title={achievement.description}
                    className={cn(
                      "flex w-24 shrink-0 flex-col items-center gap-2 rounded-lg border border-border p-3 text-center",
                      !achievement.unlocked && "opacity-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full",
                        achievement.unlocked
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {achievement.unlocked ? (
                        <achievement.icon className="size-5" />
                      ) : (
                        <LockIcon className="size-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium">
                      {achievement.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your week</CardTitle>
            <CardDescription>
              {weeklyCheckins} check-ins · {weeklyRate}% completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end justify-between gap-1.5">
              {WEEKLY_DAILY_COUNTS.map((day, index) => {
                const isToday = index === WEEKLY_DAILY_COUNTS.length - 1
                return (
                  <div
                    key={day.date}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <div className="flex h-20 w-full items-end">
                      <div
                        title={`${day.date}: ${day.count} of ${HABITS.length} habits`}
                        className={cn(
                          "w-full rounded-t-sm",
                          isToday ? "bg-primary" : "bg-primary/60",
                        )}
                        style={{
                          height: `${(day.count / HABITS.length) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs",
                        isToday
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {day.date.split(" ")[1]}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
