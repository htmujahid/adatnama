import {
  areaY,
  barX,
  barY,
  cell,
  d3Curve,
  defineChart,
  lineY,
} from "@tanstack/charts"
import {
  angleGrid,
  focusGroupAngle,
  pie,
  polar,
  radialArc,
  radialArea,
  radialBarAngle,
  radialGrid,
  radialText,
} from "@tanstack/charts/polar"
import { Chart } from "@tanstack/charts/react"
import { scaleBand } from "@tanstack/charts/scales/band"
import { scaleLinear } from "@tanstack/charts/scales/linear"
import { scaleOrdinal } from "@tanstack/charts/scales/ordinal"
import { scalePoint } from "@tanstack/charts/scales/point"
import { tooltip } from "@tanstack/charts/tooltip"
import { portal } from "@tanstack/charts/tooltip/portal"
import { createFileRoute } from "@tanstack/react-router"
import { curveLinearClosed, curveMonotoneX } from "d3-shape"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  doneToday,
  habitCountForDay,
  HABITS,
  HEATMAP_DAYS,
  HEATMAP_LEVEL_COLORS,
  HEATMAP_WEEKS,
} from "./-data"

export const Route = createFileRoute("/home/insights")({
  component: InsightsPage,
})

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

const WEEKLY_CHECKINS_BY_HABIT = HABITS.map((habit) => ({
  name: habit.name,
  checkins: habit.week.filter((day) => day === "done").length,
})).sort((a, b) => b.checkins - a.checkins)

const HABIT_STREAK_BARS = HABITS.map((habit) => ({
  name: habit.name.split(" ")[0],
  streak: habit.streak,
}))

const WEEKLY_RATE_TREND = [
  { week: "Wk 1", rate: 62 },
  { week: "Wk 2", rate: 71 },
  { week: "Wk 3", rate: 68 },
  { week: "Wk 4", rate: 79 },
  { week: "Wk 5", rate: 74 },
  { week: "Wk 6", rate: 86 },
] as const

const TODAY_BREAKDOWN = [
  { status: "completed", count: doneToday },
  { status: "pending", count: HABITS.length - doneToday },
] as const

const WEEKLY_GOAL_PERCENT = 86

const HABIT_BALANCE = [
  { category: "Fitness", score: 82 },
  { category: "Mindful", score: 55 },
  { category: "Nutrition", score: 70 },
  { category: "Learning", score: 64 },
  { category: "Social", score: 45 },
] as const

const HEATMAP_WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const
const HEATMAP_MONTHS = [
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
] as const

const STREAK_HEATMAP = Array.from({ length: HEATMAP_DAYS }, (_, dayIndex) => {
  const week = Math.floor(dayIndex / 7)
  const weekday = HEATMAP_WEEKDAYS[dayIndex % 7]
  const month =
    HEATMAP_MONTHS[Math.floor((week / HEATMAP_WEEKS) * HEATMAP_MONTHS.length)]
  return {
    dateKey: `w${week}-${weekday}`,
    week,
    weekday,
    month,
    count: habitCountForDay(dayIndex),
  }
})

const HEATMAP_MONTH_TICKS = HEATMAP_MONTHS.map((month, index) => ({
  week: Math.round((index * HEATMAP_WEEKS) / HEATMAP_MONTHS.length),
  month,
}))

const streakHeatmapChart = defineChart({
  marks: [
    cell(STREAK_HEATMAP, {
      x: "week",
      y: "weekday",
      color: "count",
      key: "dateKey",
      inset: 2,
      radius: 2,
    }),
  ],
  x: {
    scale: scaleBand<number>()
      .domain(Array.from({ length: HEATMAP_WEEKS }, (_, index) => index))
      .paddingInner(0.15)
      .paddingOuter(0.02),
    axis: {
      line: false,
      ticks: {
        values: HEATMAP_MONTH_TICKS.map((tick) => tick.week),
        size: 0,
        padding: 6,
        format: (week) =>
          HEATMAP_MONTH_TICKS.find((tick) => tick.week === week)?.month ?? "",
      },
      tickLabels: { fontSize: 11, opacity: 0.65 },
    },
  },
  y: {
    scale: scaleBand<string>()
      .domain([...HEATMAP_WEEKDAYS])
      .paddingInner(0.15)
      .paddingOuter(0.02),
    axis: false,
  },
  color: {
    scale: scaleOrdinal<number, string>()
      .domain([0, 1, 2, 3, 4, 5])
      .range([...HEATMAP_LEVEL_COLORS]),
  },
  margin: { top: 4, right: 4, bottom: 20, left: 4 },
  tooltip: {
    use: tooltip,
    anchor: "point",
    portal,
    format: (point) =>
      `${point.datum.month} · ${point.datum.weekday}: ${point.datum.count} of 5 habits`,
  },
})

const streakTrendChart = defineChart({
  marks: [
    areaY(STREAK_TREND, {
      x: "date",
      y: "streak",
      fill: "url(#streak-fill)",
      stroke: "var(--primary)",
      strokeWidth: 2,
      curve: d3Curve(curveMonotoneX),
    }),
  ],
  x: {
    scale: () => scalePoint().padding(0.1),
    axis: {
      ticks: {
        values: STREAK_TREND.filter((_, index) => index % 2 === 0).map(
          (point) => point.date,
        ),
      },
    },
  },
  y: { scale: scaleLinear, nice: true, grid: true },
  gradients: [
    {
      id: "streak-fill",
      x1: 0,
      y1: 1,
      x2: 0,
      y2: 0,
      stops: [
        { offset: 0, color: "var(--primary)", opacity: 0.05 },
        { offset: 1, color: "var(--primary)", opacity: 0.55 },
      ],
    },
  ],
  tooltip: {
    use: tooltip,
    content: (points) => ({
      title: String(points[0]?.xValue ?? ""),
      rows: points.map((point) => ({
        label: "Streak",
        value: String(point.yValue),
        color: "var(--primary)",
      })),
    }),
  },
})

const weeklyCheckinsChart = defineChart({
  marks: [
    barX(WEEKLY_CHECKINS_BY_HABIT, {
      x: "checkins",
      y: "name",
      fill: "var(--primary)",
      radius: 5,
    }),
  ],
  x: { scale: scaleLinear, axis: false },
  y: {
    scale: () => scaleBand<string>().paddingInner(0.18).paddingOuter(0.08),
    axis: { line: false, ticks: { size: 0, padding: 10 } },
  },
  margin: { top: 5, right: 5, bottom: 5, left: 110 },
  focus: "group-x",
  tooltip: {
    use: tooltip,
    anchor: "group-center",
    placement: "auto",
    content: (points) => ({
      title: String(points[0]?.yValue ?? ""),
      rows: points.map((point) => ({
        label: "Check-ins this week",
        value: String(point.xValue),
        color: "var(--primary)",
      })),
    }),
  },
})

const habitStreakBarChart = defineChart({
  marks: [
    barY(HABIT_STREAK_BARS, {
      x: "name",
      y: "streak",
      fill: "var(--primary)",
      inset: 1,
      radius: 5,
    }),
  ],
  x: { scale: () => scaleBand().padding(0.3) },
  y: { scale: scaleLinear, nice: true, grid: true },
  tooltip: {
    use: tooltip,
    content: (points) => ({
      title: String(points[0]?.xValue ?? ""),
      rows: points.map((point) => ({
        label: "Current streak",
        value: String(point.yValue),
        color: "var(--primary)",
      })),
    }),
  },
})

const weeklyRateLineChart = defineChart({
  marks: [
    lineY(WEEKLY_RATE_TREND, {
      x: "week",
      y: "rate",
      stroke: "var(--primary)",
      strokeWidth: 2,
      points: true,
      curve: d3Curve(curveMonotoneX),
    }),
  ],
  x: { scale: () => scalePoint().padding(0.2) },
  y: {
    scale: scaleLinear().domain([0, 100]),
    grid: true,
    axis: { ticks: { format: (value: number) => `${value}%` } },
  },
  tooltip: {
    use: tooltip,
    content: (points) => ({
      title: String(points[0]?.xValue ?? ""),
      rows: points.map((point) => ({
        label: "Completion rate",
        value: `${point.yValue}%`,
        color: "var(--primary)",
      })),
    }),
  },
})

function polarAngleFromTop(degrees: number) {
  return ((90 - degrees) * Math.PI) / 180
}

function radialCenterLabel(id: string, total: string, caption: string) {
  return polar({
    angle: { scale: scaleLinear().domain([0, 1]) },
    radius: { scale: scaleLinear().domain([0, 1]) },
    marks: [
      radialText([{ id: "total", text: total }], {
        id: `${id}-total`,
        angle: 0,
        radius: 0,
        key: "id",
        text: "text",
        dy: -2,
        fill: "var(--foreground)",
        fontSize: 22,
        fontWeight: 700,
      }),
      radialText([{ id: "caption", text: caption }], {
        id: `${id}-caption`,
        angle: 0,
        radius: 0,
        key: "id",
        text: "text",
        dy: 18,
        fill: "var(--muted-foreground)",
        fontSize: 12,
      }),
    ],
  })
}

function breakdownDatum(datum: unknown) {
  if (!datum || typeof datum !== "object") return undefined
  const status = Reflect.get(datum, "status")
  const count = Reflect.get(datum, "count")
  return (status === "completed" || status === "pending") &&
    typeof count === "number"
    ? { status, count }
    : undefined
}

const todayBreakdownSlices = pie(TODAY_BREAKDOWN, { value: "count" })

const todayBreakdownChart = defineChart({
  marks: [
    polar({
      inset: 4,
      radiusRatio: 0.85,
      angle: { scale: scaleLinear().domain([0, Math.PI * 2]) },
      radius: { scale: scaleLinear().domain([0, 1]) },
      marks: [
        radialArc(todayBreakdownSlices, {
          id: "today-breakdown-slices",
          key: "status",
          innerRadius: ({ radius }) => radius * 0.62,
          cornerRadius: 3,
          color: "status",
          stroke: "var(--background)",
          strokeWidth: 1,
        }),
        radialText([{ id: "total", text: `${doneToday}/${HABITS.length}` }], {
          id: "today-breakdown-total",
          angle: 0,
          radius: 0,
          key: "id",
          text: "text",
          dy: -5,
          fill: "var(--foreground)",
          fontSize: 22,
          fontWeight: 700,
        }),
        radialText([{ id: "label", text: "done today" }], {
          id: "today-breakdown-label",
          angle: 0,
          radius: 0,
          key: "id",
          text: "text",
          dy: 19,
          fill: "var(--muted-foreground)",
          fontSize: 12,
        }),
      ],
    }),
  ],
  color: {
    domain: ["completed", "pending"],
    range: ["var(--primary)", "var(--muted-foreground)"],
  },
  margin: 0,
  focus: focusGroupAngle,
  tooltip: {
    use: tooltip,
    anchor: "group-center",
    placement: "auto",
    sort: "color-domain",
    content: (points) => {
      const point = points.find((candidate) => breakdownDatum(candidate.datum))
      const datum = point && breakdownDatum(point.datum)
      if (!point || !datum) return { rows: [] }
      return {
        title: datum.status === "completed" ? "Completed" : "Pending",
        rows: [
          { label: "Habits", value: String(datum.count), color: point.color },
        ],
      }
    },
  },
})

const weeklyGoalBackground = pie([{ id: "background", value: 1 }] as const, {
  value: "value",
})

const weeklyGoalRows = [
  { metric: "completion", value: WEEKLY_GOAL_PERCENT, ring: "completion" },
] as const

const weeklyGoalChart = defineChart({
  marks: [
    polar({
      marks: [
        radialArc(weeklyGoalBackground, {
          id: "weekly-goal-background",
          key: "id",
          innerRadius: ({ radius }) => radius * 0.62,
          outerRadius: ({ radius }) => radius * 0.82,
          fill: "var(--muted)",
        }),
      ],
    }),
    polar({
      startAngle: polarAngleFromTop(0),
      endAngle: polarAngleFromTop(250),
      angle: { scale: scaleLinear().domain([0, 100]) },
      radius: {
        scale: scaleBand<string>().domain(["completion"]),
        range: [({ radius }) => radius * 0.62, ({ radius }) => radius * 0.82],
      },
      marks: [
        radialBarAngle(weeklyGoalRows, {
          id: "weekly-goal-value",
          angle: "value",
          radius: "ring",
          key: "metric",
          fill: "var(--primary)",
          cornerRadius: 10,
        }),
      ],
    }),
    radialCenterLabel("weekly-goal", `${WEEKLY_GOAL_PERCENT}%`, "of goal"),
  ],
  focus: focusGroupAngle,
  tooltip: {
    use: tooltip,
    content: () => ({
      rows: [
        {
          label: "Weekly goal",
          value: `${WEEKLY_GOAL_PERCENT}%`,
          color: "var(--primary)",
        },
      ],
    }),
  },
})

const habitBalanceCategories = HABIT_BALANCE.map((row) => row.category)

const habitBalanceChart = defineChart({
  marks: [
    polar({
      radiusRatio: 0.76,
      angle: {
        scale: scalePoint<string>().domain(habitBalanceCategories),
        wrap: true,
      },
      radius: { scale: scaleLinear().domain([0, 100]) },
      guides: [
        radialGrid({
          values: [25, 50, 75, 100],
          shape: "polygon",
          stroke: "var(--border)",
          strokeOpacity: 1,
        }),
        angleGrid({
          labels: true,
          labelOffset: 10,
          labelFill: "var(--muted-foreground)",
          labelFontSize: 12,
          stroke: "var(--border)",
          strokeOpacity: 1,
        }),
      ],
      marks: [
        radialArea(HABIT_BALANCE, {
          id: "habit-balance-radar",
          angle: "category",
          radius: "score",
          key: "category",
          z: () => "score",
          curve: curveLinearClosed,
          fill: "var(--primary)",
          fillOpacity: 0.28,
          stroke: "var(--primary)",
          strokeOpacity: 1,
          strokeWidth: 2,
        }),
      ],
    }),
  ],
  margin: 0,
  focus: focusGroupAngle,
  tooltip: {
    use: tooltip,
    content: (points) => ({
      title: String(points[0]?.xValue ?? ""),
      rows: points.map((point) => ({
        label: "Score",
        value: String(point.yValue),
        color: point.color,
      })),
    }),
  },
})

function InsightsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          Trends and patterns across your habits.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current streak</CardTitle>
            <CardDescription>Morning run, last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-w-0">
              <Chart
                definition={streakTrendChart}
                height={200}
                initialWidth={480}
                ariaLabel="Morning run streak, last 14 days"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check-ins by habit</CardTitle>
            <CardDescription>Times completed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-w-0">
              <Chart
                definition={weeklyCheckinsChart}
                height={200}
                initialWidth={480}
                ariaLabel="Check-ins by habit, this week"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Year in check-ins</CardTitle>
          <CardDescription>
            Habits completed per day, last 12 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-w-0 overflow-x-auto">
            <Chart
              definition={streakHeatmapChart}
              aspectRatio={6.466}
              style={{ minWidth: 1048 }}
              ariaLabel="Habits completed per day over the last 12 months"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Streaks by habit</CardTitle>
            <CardDescription>Current streak length, per habit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-w-0">
              <Chart
                definition={habitStreakBarChart}
                height={200}
                initialWidth={480}
                ariaLabel="Current streak length, per habit"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly completion rate</CardTitle>
            <CardDescription>Last 6 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-w-0">
              <Chart
                definition={weeklyRateLineChart}
                height={200}
                initialWidth={480}
                ariaLabel="Weekly completion rate, last 6 weeks"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle>Today's breakdown</CardTitle>
            <CardDescription>Completed vs. pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto min-w-0 max-w-[220px]">
              <Chart
                definition={todayBreakdownChart}
                height={200}
                initialWidth={220}
                ariaLabel={`${doneToday} of ${HABITS.length} habits completed today`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle>Weekly goal</CardTitle>
            <CardDescription>Target: 80% completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto min-w-0 max-w-[220px]">
              <Chart
                definition={weeklyGoalChart}
                height={200}
                initialWidth={220}
                ariaLabel={`${WEEKLY_GOAL_PERCENT}% of weekly goal`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle>Habit balance</CardTitle>
            <CardDescription>Score by life area, this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto min-w-0 max-w-[240px]">
              <Chart
                definition={habitBalanceChart}
                height={220}
                initialWidth={240}
                ariaLabel="Habit balance score by life area, this week"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
