import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CalendarCheckIcon,
  ChevronRightIcon,
  FlagIcon,
  FlameIcon,
  LockIcon,
  MedalIcon,
  SparklesIcon,
  TargetIcon,
  TriangleAlertIcon,
  TrophyIcon,
  UsersIcon,
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
import { doneToday, HABITS } from "./-data"

export const Route = createFileRoute("/home/")({ component: HomePage })

const CIRCLES = [
  { name: "Family", members: ["A", "M", "S", "Y"], checkedIn: 3 },
  { name: "Friends", members: ["J", "K", "L", "P"], checkedIn: 2 },
  { name: "Accountability Partners", members: ["N", "Q"], checkedIn: 1 },
] as const

const STATS = [
  {
    label: "Current streak",
    value: "12 days",
    badge: "Morning run",
    icon: FlameIcon,
  },
  {
    label: "Today",
    value: "4 of 5 habits",
    badge: "1 left",
    icon: CalendarCheckIcon,
  },
  {
    label: "Level",
    value: "4",
    badge: "320 XP",
    icon: ZapIcon,
  },
] as const

const ACHIEVEMENTS = [
  {
    name: "First step",
    description: "Complete your first check-in",
    icon: FlagIcon,
    unlocked: true,
  },
  {
    name: "Week warrior",
    description: "Hit a 7-day streak",
    icon: FlameIcon,
    unlocked: true,
  },
  {
    name: "Consistent",
    description: "80%+ completion in a week",
    icon: TargetIcon,
    unlocked: true,
  },
  {
    name: "Team player",
    description: "Join a circle",
    icon: UsersIcon,
    unlocked: true,
  },
  {
    name: "Month master",
    description: "Hit a 30-day streak",
    icon: TrophyIcon,
    unlocked: false,
  },
  {
    name: "Perfect week",
    description: "Every habit, every day",
    icon: SparklesIcon,
    unlocked: false,
  },
] as const

const MILESTONES = [7, 30, 100] as const

const strongestHabit = [...HABITS].sort((a, b) => b.streak - a.streak)[0]
const attentionHabit = [...HABITS].sort((a, b) => a.streak - b.streak)[0]

const milestoneProgress = HABITS.map((habit) => {
  const next = MILESTONES.find((milestone) => milestone > habit.streak)
  return next ? { habit, next, daysLeft: next - habit.streak } : null
}).filter((entry) => entry !== null)
const closestMilestone = [...milestoneProgress].sort(
  (a, b) => a.daysLeft - b.daysLeft,
)[0]

const HIGHLIGHTS = [
  {
    title: "Strongest streak",
    description: `${strongestHabit.name} · ${strongestHabit.streak} days`,
    icon: FlameIcon,
    habitId: strongestHabit.id,
  },
  {
    title: "Next milestone",
    description: `${closestMilestone.habit.name} · ${closestMilestone.daysLeft} day${closestMilestone.daysLeft === 1 ? "" : "s"} to ${closestMilestone.next}`,
    icon: MedalIcon,
    habitId: closestMilestone.habit.id,
  },
  {
    title: "Needs attention",
    description:
      attentionHabit.streak === 0
        ? `${attentionHabit.name} · streak reset`
        : `${attentionHabit.name} · ${attentionHabit.streak} day streak`,
    icon: TriangleAlertIcon,
    habitId: attentionHabit.id,
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

      <div className="grid gap-4 sm:grid-cols-3">
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

      <div className="grid gap-4 lg:grid-cols-3">
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {ACHIEVEMENTS.map((achievement) => (
                <div
                  key={achievement.name}
                  title={achievement.description}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center",
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
            <CardDescription>What's happening this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {HIGHLIGHTS.map((highlight) => (
                <Item
                  key={highlight.title}
                  variant="outline"
                  size="sm"
                  render={
                    <Link
                      to="/home/habits/$habitId"
                      params={{ habitId: highlight.habitId }}
                    />
                  }
                >
                  <ItemMedia>
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <highlight.icon className="size-4" />
                    </span>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{highlight.title}</ItemTitle>
                    <ItemDescription>{highlight.description}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </ItemActions>
                </Item>
              ))}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
