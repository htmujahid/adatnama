import { useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Link } from "@tanstack/react-router"
import { format } from "date-fns"
import {
  CalendarCheckIcon,
  FlameIcon,
  ListChecksIcon,
  LockIcon,
  PlusIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
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
import { Skeleton } from "@/components/ui/skeleton"
import { useAchievements } from "@/hooks/use-achievements"
import { useHabitCheckins } from "@/hooks/use-habit-checkins"
import { useActiveHabits } from "@/hooks/use-habits"
import type { HabitView } from "@/hooks/use-habits"
import { useHomeUser } from "@/hooks/use-home-user"
import { circlesCollection } from "@/lib/collection/circles"
import { isScheduledOn, lastNDays, WEEK_LENGTH } from "@/lib/habits"
import type { HabitDayState } from "@/lib/habits"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/home/")({ component: HomePage })

function WeekDots({ week }: { week: ReadonlyArray<HabitDayState> }) {
  return (
    <div className="flex items-center gap-1.5">
      {week.map((day, index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 rounded-full",
            day === "done" && "bg-primary",
            day === "missed" && "bg-muted",
            day === "frozen" && "bg-sky-400 dark:bg-sky-500",
            day === "today" && "bg-muted ring-2 ring-primary/30",
          )}
        />
      ))}
    </div>
  )
}

function TodayHabitItem({ habit }: { habit: HabitView }) {
  const { todayByHabitId, toggleCheckin } = useHabitCheckins()
  const note = todayByHabitId.get(habit.id)?.note ?? ""
  const done = habit.doneToday

  return (
    <Item
      variant="outline"
      onClick={() => toggleCheckin(habit.id)}
      className="cursor-pointer select-none transition-colors hover:bg-muted/60 active:bg-muted"
    >
      <ItemMedia>
        <Checkbox
          checked={done}
          onCheckedChange={() => toggleCheckin(habit.id)}
          onClick={(event) => {
            event.stopPropagation()
          }}
          aria-label={`Mark ${habit.name} as ${done ? "not done" : "done"} for today`}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{habit.name}</ItemTitle>
        <ItemDescription>
          {habit.freezesLeft > 0
            ? `${habit.freezesLeft} freeze${habit.freezesLeft > 1 ? "s" : ""} left`
            : "No freezes left"}
        </ItemDescription>
        {note && <ItemDescription className="italic">"{note}"</ItemDescription>}
      </ItemContent>
      <ItemActions>
        <WeekDots week={habit.week} />
        <HabitNoteButton habitId={habit.id} habitName={habit.name} />
        <Badge variant={done ? "secondary" : "outline"}>
          <FlameIcon />
          {habit.streak}
        </Badge>
      </ItemActions>
    </Item>
  )
}

function CirclesSummaryCard() {
  const { data: circles = [], isLoading } = useLiveQuery((q) =>
    q.from({ circle: circlesCollection }),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circles</CardTitle>
        <CardDescription>Shared streaks with your people</CardDescription>
        <CardAction>
          <Link
            to="/home/circles"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : circles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven't joined a circle yet.
          </p>
        ) : (
          <ItemGroup>
            {circles.map((circle) => (
              <Item key={circle.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>
                    <CircleColorDot color={circle.color} />
                    {circle.name}
                  </ItemTitle>
                  <ItemDescription>
                    {circle.members.length === 1
                      ? "1 member"
                      : `${circle.members.length} members`}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}

function AchievementsSummaryCard() {
  const { achievements, unlockedCount, isLoading } = useAchievements()

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          {unlockedCount} of {achievements.length} unlocked
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
        {isLoading ? (
          <div className="flex gap-3 pb-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-24 shrink-0 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <div className="flex gap-3 pb-1">
              {achievements.map((achievement) => (
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
        )}
      </CardContent>
    </Card>
  )
}

function HomePage() {
  const user = useHomeUser()
  const firstName = user.name.split(" ")[0]
  const { habits, checkins, isLoading } = useActiveHabits()
  const { unlockedCount } = useAchievements()

  const today = new Date()
  const todayHabits = habits.filter((habit) => isScheduledOn(habit, today))
  const doneToday = todayHabits.filter((habit) => habit.doneToday).length
  const strongestHabit = [...habits].sort((a, b) => b.streak - a.streak).at(0)

  const weekDates = lastNDays(WEEK_LENGTH, today)
  const weeklyDailyCounts = weekDates.map((date, index) => ({
    date: format(date, "MMM d"),
    count: habits.filter((habit) => habit.week[index] === "done").length,
  }))
  const weeklyCheckins = weeklyDailyCounts.reduce(
    (sum, day) => sum + day.count,
    0,
  )
  const weeklyRate =
    habits.length > 0
      ? Math.round((weeklyCheckins / (WEEK_LENGTH * habits.length)) * 100)
      : 0

  const totalDone = checkins.filter(
    (checkin) => checkin.status === "done",
  ).length
  const xp = totalDone * 10 + unlockedCount * 50
  const level = 1 + Math.floor(xp / 200)

  const stats = [
    {
      label: "Current streak",
      value: strongestHabit ? `${strongestHabit.streak} days` : "—",
      badge: strongestHabit?.name ?? "No habits yet",
      icon: FlameIcon,
    },
    {
      label: "Today",
      value: `${doneToday} of ${todayHabits.length} habits`,
      badge: `${todayHabits.length - doneToday} left`,
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
      value: `${level}`,
      badge: `${xp} XP`,
      icon: ZapIcon,
    },
  ] as const

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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's habits</CardTitle>
            <CardDescription>
              {doneToday} of {todayHabits.length} habits checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            ) : todayHabits.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ListChecksIcon className="size-5" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {habits.length === 0
                    ? "You aren't tracking any habits yet."
                    : "No habits are scheduled for today."}
                </p>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link to="/home/habits/new" />}
                >
                  <PlusIcon />
                  New habit
                </Button>
              </div>
            ) : (
              <ItemGroup>
                {todayHabits.map((habit) => (
                  <TodayHabitItem key={habit.id} habit={habit} />
                ))}
              </ItemGroup>
            )}
          </CardContent>
        </Card>

        <CirclesSummaryCard />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <AchievementsSummaryCard />

        <Card>
          <CardHeader>
            <CardTitle>Your week</CardTitle>
            <CardDescription>
              {weeklyCheckins} check-ins · {weeklyRate}% completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-24 items-end justify-between gap-1.5">
              {weeklyDailyCounts.map((day, index) => {
                const isToday = index === weeklyDailyCounts.length - 1
                return (
                  <div
                    key={day.date}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <div className="flex h-20 w-full items-end">
                      <div
                        title={`${day.date}: ${day.count} of ${habits.length} habits`}
                        className={cn(
                          "w-full rounded-t-sm",
                          isToday ? "bg-primary" : "bg-primary/60",
                        )}
                        style={{
                          height: `${habits.length > 0 ? (day.count / habits.length) * 100 : 0}%`,
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
