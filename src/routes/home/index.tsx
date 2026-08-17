import { createFileRoute } from "@tanstack/react-router"
import {
  CalendarCheckIcon,
  CrownIcon,
  FlagIcon,
  FlameIcon,
  LockIcon,
  SparklesIcon,
  TargetIcon,
  TrophyIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"

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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
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

export const Route = createFileRoute("/home/")({ component: HomePage })

type DayState = "done" | "missed" | "today"

const HABITS = [
  {
    name: "Morning run",
    streak: 12,
    freezes: 1,
    done: true,
    week: ["done", "done", "done", "done", "done", "done", "done"],
  },
  {
    name: "Read 20 pages",
    streak: 8,
    freezes: 2,
    done: true,
    week: ["missed", "done", "done", "done", "done", "done", "done"],
  },
  {
    name: "Drink 2L water",
    streak: 21,
    freezes: 0,
    done: true,
    week: ["done", "done", "done", "done", "done", "done", "done"],
  },
  {
    name: "No sugar",
    streak: 3,
    freezes: 1,
    done: true,
    week: ["missed", "missed", "missed", "done", "done", "done", "done"],
  },
  {
    name: "Meditate",
    streak: 0,
    freezes: 0,
    done: false,
    week: ["missed", "missed", "done", "missed", "missed", "missed", "today"],
  },
] as const satisfies ReadonlyArray<{
  name: string
  streak: number
  freezes: number
  done: boolean
  week: ReadonlyArray<DayState>
}>

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
    label: "Longest streak",
    value: "27 days",
    badge: "Drink 2L water",
    icon: TrophyIcon,
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

const LEADERBOARD = [
  { name: "You", streak: 12, isYou: true },
  { name: "Ayesha", streak: 9, isYou: false },
  { name: "Musa", streak: 6, isYou: false },
  { name: "Sara", streak: 4, isYou: false },
] as const

const COMPLETION_TREND = [
  { date: "Aug 4", completed: 4 },
  { date: "Aug 5", completed: 5 },
  { date: "Aug 6", completed: 3 },
  { date: "Aug 7", completed: 5 },
  { date: "Aug 8", completed: 4 },
  { date: "Aug 9", completed: 2 },
  { date: "Aug 10", completed: 4 },
  { date: "Aug 11", completed: 5 },
  { date: "Aug 12", completed: 5 },
  { date: "Aug 13", completed: 3 },
  { date: "Aug 14", completed: 4 },
  { date: "Aug 15", completed: 5 },
  { date: "Aug 16", completed: 2 },
  { date: "Aug 17", completed: 4 },
] as const

const completionChartConfig = {
  completed: {
    label: "Habits completed",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const STREAK_TREND = [
  { date: "Aug 4", streak: 3 },
  { date: "Aug 5", streak: 0 },
  { date: "Aug 6", streak: 1 },
  { date: "Aug 7", streak: 2 },
  { date: "Aug 8", streak: 3 },
  { date: "Aug 9", streak: 4 },
  { date: "Aug 10", streak: 5 },
  { date: "Aug 11", streak: 6 },
  { date: "Aug 12", streak: 7 },
  { date: "Aug 13", streak: 8 },
  { date: "Aug 14", streak: 9 },
  { date: "Aug 15", streak: 10 },
  { date: "Aug 16", streak: 11 },
  { date: "Aug 17", streak: 12 },
] as const

const streakChartConfig = {
  streak: {
    label: "Current streak",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const HABIT_STREAK_BARS = HABITS.map((habit) => ({
  name: habit.name,
  streak: habit.streak,
}))

const habitStreakChartConfig = {
  streak: {
    label: "Streak",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const WEEKLY_RATE_TREND = [
  { week: "Wk 1", rate: 62 },
  { week: "Wk 2", rate: 71 },
  { week: "Wk 3", rate: 68 },
  { week: "Wk 4", rate: 79 },
  { week: "Wk 5", rate: 74 },
  { week: "Wk 6", rate: 86 },
] as const

const weeklyRateChartConfig = {
  rate: {
    label: "Completion rate",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const TODAY_BREAKDOWN = [
  { status: "completed", count: 4, fill: "var(--color-completed)" },
  { status: "pending", count: 1, fill: "var(--color-pending)" },
] as const

const todayBreakdownChartConfig = {
  count: {
    label: "Habits",
  },
  completed: {
    label: "Completed",
    color: "var(--primary)",
  },
  pending: {
    label: "Pending",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

const WEEKLY_GOAL_PERCENT = 86

const WEEKLY_GOAL_DATA = [
  { metric: "completion", value: WEEKLY_GOAL_PERCENT },
] as const

const weeklyGoalChartConfig = {
  completion: {
    label: "Completion",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const HABIT_BALANCE = [
  { category: "Fitness", score: 82 },
  { category: "Mindful", score: 55 },
  { category: "Nutrition", score: 70 },
  { category: "Learning", score: 64 },
  { category: "Social", score: 45 },
] as const

const habitBalanceChartConfig = {
  score: {
    label: "This week",
    color: "var(--primary)",
  },
} satisfies ChartConfig

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
  const doneToday = HABITS.filter((habit) => habit.done).length

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check-ins</CardTitle>
            <CardDescription>
              Habits completed per day, last 14 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={completionChartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <AreaChart data={[...COMPLETION_TREND]}>
                <defs>
                  <linearGradient
                    id="fillCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-completed)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  domain={[0, 5]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="completed"
                  type="natural"
                  fill="url(#fillCompleted)"
                  stroke="var(--color-completed)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current streak</CardTitle>
            <CardDescription>Morning run, last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={streakChartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <AreaChart data={[...STREAK_TREND]}>
                <defs>
                  <linearGradient id="fillStreak" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-streak)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-streak)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="streak"
                  type="natural"
                  fill="url(#fillStreak)"
                  stroke="var(--color-streak)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Streaks by habit</CardTitle>
            <CardDescription>Current streak length, per habit</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={habitStreakChartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <BarChart data={HABIT_STREAK_BARS}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => value.split(" ")[0]}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="streak" fill="var(--color-streak)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly completion rate</CardTitle>
            <CardDescription>Last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={weeklyRateChartConfig}
              className="aspect-auto h-[200px] w-full"
            >
              <LineChart data={[...WEEKLY_RATE_TREND]}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  domain={[0, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="rate"
                  type="monotone"
                  stroke="var(--color-rate)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-rate)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle>Today's breakdown</CardTitle>
            <CardDescription>Completed vs. pending</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={todayBreakdownChartConfig}
              className="mx-auto aspect-square w-full max-w-[240px] max-h-[210px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={[...TODAY_BREAKDOWN]}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (
                        !viewBox ||
                        !("cx" in viewBox) ||
                        !("cy" in viewBox)
                      ) {
                        return null
                      }
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {doneToday}/{HABITS.length}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            done today
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle>Weekly goal</CardTitle>
            <CardDescription>Target: 80% completion</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={weeklyGoalChartConfig}
              className="mx-auto aspect-square w-full max-w-[240px] max-h-[210px]"
            >
              <RadialBarChart
                data={[...WEEKLY_GOAL_DATA]}
                startAngle={90}
                endAngle={90 - (WEEKLY_GOAL_PERCENT / 100) * 360}
                innerRadius={65}
                outerRadius={95}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[70, 60]}
                />
                <RadialBar
                  dataKey="value"
                  background
                  cornerRadius={8}
                  fill="var(--color-completion)"
                />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (
                        !viewBox ||
                        !("cx" in viewBox) ||
                        !("cy" in viewBox)
                      ) {
                        return null
                      }
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {WEEKLY_GOAL_PERCENT}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            of goal
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle>Habit balance</CardTitle>
            <CardDescription>Score by life area, this week</CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <ChartContainer
              config={habitBalanceChartConfig}
              className="mx-auto aspect-square w-full max-w-[240px] max-h-[210px]"
            >
              <RadarChart data={[...HABIT_BALANCE]} outerRadius="60%">
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarAngleAxis dataKey="category" />
                <PolarGrid />
                <Radar
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.5}
                  stroke="var(--color-score)"
                />
              </RadarChart>
            </ChartContainer>
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
            <CardTitle>Family leaderboard</CardTitle>
            <CardDescription>Ranked by current streak</CardDescription>
          </CardHeader>
          <CardContent>
            <ItemGroup>
              {LEADERBOARD.map((member, index) => (
                <Item
                  key={member.name}
                  variant={member.isYou ? "muted" : "outline"}
                  size="sm"
                >
                  <ItemMedia>
                    {index === 0 ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <CrownIcon className="size-3.5" />
                      </span>
                    ) : (
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{member.name}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Badge variant="secondary">
                      <FlameIcon />
                      {member.streak}
                    </Badge>
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
