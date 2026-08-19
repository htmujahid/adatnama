import { useMemo } from "react"
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
import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { curveLinearClosed, curveMonotoneX } from "d3-shape"
import {
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns"
import { ChartColumnIcon, PlusIcon } from "lucide-react"

import { ChartCard } from "@/components/insights/chart-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { categoriesCollection } from "@/lib/collection/categories"
import { checkinsCollection } from "@/lib/collection/checkins"
import type { CheckinRecord } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import type { HabitView } from "@/lib/habits"
import {
  computeHabitStats,
  dateKey,
  foldHabitCheckinRows,
  HEATMAP_LEVEL_COLORS,
  heatmapLevelFor,
  isScheduledOn,
  lastNDays,
  WEEKDAYS,
} from "@/lib/habits"

const HEATMAP_WEEKS = 52

function doneDatesFor(
  checkins: ReadonlyArray<CheckinRecord>,
  habitId: string,
): Set<string> {
  const dates = new Set<string>()
  for (const checkin of checkins) {
    if (checkin.habitId === habitId && checkin.status === "done") {
      dates.add(checkin.date)
    }
  }
  return dates
}

function weeklyCompletion(
  habits: ReadonlyArray<HabitView>,
  doneCountByDate: ReadonlyMap<string, number>,
  days: ReadonlyArray<Date>,
): { done: number; scheduled: number; rate: number } {
  let done = 0
  let scheduled = 0
  for (const day of days) {
    done += doneCountByDate.get(dateKey(day)) ?? 0
    scheduled += habits.filter((habit) => isScheduledOn(habit, day)).length
  }
  return {
    done,
    scheduled,
    rate: scheduled > 0 ? Math.round((done / scheduled) * 100) : 0,
  }
}

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

export function InsightsCharts() {
  const { data: habitRows = [], isLoading: habitsLoading } = useLiveQuery((q) =>
    q
      .from({ habit: habitsCollection })
      .leftJoin(
        {
          checkin: q
            .from({ checkin: checkinsCollection })
            .where(({ checkin }) => eq(checkin.status, "done")),
        },
        ({ habit, checkin }) => eq(checkin.habitId, habit.id),
      )
      .where(({ habit }) => isNull(habit.archivedAt)),
  )
  const { data: checkins = [], isLoading: checkinsLoading } = useLiveQuery(
    (q) => q.from({ checkin: checkinsCollection }),
  )
  const isLoading = habitsLoading || checkinsLoading
  const { data: categories = [] } = useLiveQuery((q) =>
    q.from({ category: categoriesCollection }),
  )
  const todayKey = dateKey(new Date())
  const habits = useMemo(
    () => foldHabitCheckinRows(habitRows, parseISO(todayKey)),
    [habitRows, todayKey],
  )

  const data = useMemo(() => {
    const today = parseISO(todayKey)
    const doneCountByDate = new Map<string, number>()
    for (const checkin of checkins) {
      if (checkin.status !== "done") continue
      doneCountByDate.set(
        checkin.date,
        (doneCountByDate.get(checkin.date) ?? 0) + 1,
      )
    }

    const strongest = [...habits].sort((a, b) => b.streak - a.streak).at(0)
    const streakTrend = strongest
      ? (() => {
          const doneDates = doneDatesFor(checkins, strongest.id)
          return lastNDays(14, today).map((day) => ({
            date: format(day, "MMM d"),
            streak: computeHabitStats(strongest, doneDates, day).streak,
          }))
        })()
      : []

    const weeklyCheckinsByHabit = habits
      .map((habit) => ({
        name: habit.name,
        checkins: habit.week.filter((day) => day === "done").length,
      }))
      .sort((a, b) => b.checkins - a.checkins)

    const habitStreakBars = habits.map((habit) => ({
      name: habit.name.split(" ")[0],
      streak: habit.streak,
    }))

    const weekDays = lastNDays(7, today)
    const thisWeek = weeklyCompletion(habits, doneCountByDate, weekDays)
    const weeklyRateTrend = Array.from({ length: 6 }, (_, index) => {
      const end = subDays(today, (5 - index) * 7)
      return {
        week: `Wk ${index + 1}`,
        rate: weeklyCompletion(habits, doneCountByDate, lastNDays(7, end)).rate,
      }
    })

    const scheduledToday = habits.filter((habit) => isScheduledOn(habit, today))
    const doneToday = scheduledToday.filter((habit) => habit.doneToday).length
    const todayBreakdown = [
      { status: "completed", count: doneToday },
      { status: "pending", count: scheduledToday.length - doneToday },
    ]

    const habitBalance = categories
      .map((category) => {
        const categoryHabits = habits.filter(
          (habit) => habit.categoryId === category.id,
        )
        if (categoryHabits.length === 0) return null
        let done = 0
        let scheduled = 0
        for (const habit of categoryHabits) {
          done += habit.week.filter((day) => day === "done").length
          scheduled += weekDays.filter((day) =>
            isScheduledOn(habit, day),
          ).length
        }
        return {
          category: category.name,
          score: scheduled > 0 ? Math.round((done / scheduled) * 100) : 0,
        }
      })
      .filter((row) => row !== null)

    const heatmapStart = startOfWeek(subDays(today, HEATMAP_WEEKS * 7 - 1))
    const heatmapCells = eachDayOfInterval({
      start: heatmapStart,
      end: today,
    }).map((day, index) => {
      const key = dateKey(day)
      const done = doneCountByDate.get(key) ?? 0
      const scheduled = habits.filter((habit) =>
        isScheduledOn(habit, day),
      ).length
      return {
        dateKey: key,
        week: Math.floor(index / 7),
        weekday: WEEKDAYS[day.getDay()].short,
        label: format(day, "MMM d"),
        done,
        scheduled,
        level: heatmapLevelFor(done, scheduled),
      }
    })
    const heatmapWeekCount = Math.ceil(heatmapCells.length / 7)
    const heatmapMonthTicks: Array<{ week: number; month: string }> = []
    for (let week = 0; week < heatmapWeekCount; week++) {
      const first = heatmapCells[week * 7]
      const month = first.label.split(" ")[0]
      const previous = heatmapMonthTicks.at(-1)
      if (!previous || previous.month !== month) {
        heatmapMonthTicks.push({ week, month })
      }
    }

    return {
      strongest,
      streakTrend,
      weeklyCheckinsByHabit,
      habitStreakBars,
      thisWeek,
      weeklyRateTrend,
      scheduledToday,
      doneToday,
      todayBreakdown,
      habitBalance,
      heatmapCells,
      heatmapWeekCount,
      heatmapMonthTicks,
    }
  }, [habits, checkins, categories, todayKey])

  const charts = useMemo(() => {
    const {
      streakTrend,
      weeklyCheckinsByHabit,
      habitStreakBars,
      thisWeek,
      weeklyRateTrend,
      scheduledToday,
      doneToday,
      todayBreakdown,
      habitBalance,
      heatmapCells,
      heatmapWeekCount,
      heatmapMonthTicks,
    } = data

    const streakTrendChart = defineChart({
      marks: [
        areaY(streakTrend, {
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
            values: streakTrend
              .filter((_, index) => index % 2 === 0)
              .map((point) => point.date),
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
        barX(weeklyCheckinsByHabit, {
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
        barY(habitStreakBars, {
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
        lineY(weeklyRateTrend, {
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

    const streakHeatmapChart = defineChart({
      marks: [
        cell(heatmapCells, {
          x: "week",
          y: "weekday",
          color: "level",
          key: "dateKey",
          inset: 2,
          radius: 2,
        }),
      ],
      x: {
        scale: scaleBand<number>()
          .domain(Array.from({ length: heatmapWeekCount }, (_, index) => index))
          .paddingInner(0.15)
          .paddingOuter(0.02),
        axis: {
          line: false,
          ticks: {
            values: heatmapMonthTicks.map((tick) => tick.week),
            size: 0,
            padding: 6,
            format: (week) =>
              heatmapMonthTicks.find((tick) => tick.week === week)?.month ?? "",
          },
          tickLabels: { fontSize: 11, opacity: 0.65 },
        },
      },
      y: {
        scale: scaleBand<string>()
          .domain(WEEKDAYS.map((weekday) => weekday.short))
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
          `${point.datum.label}: ${point.datum.done} of ${point.datum.scheduled} habits`,
      },
    })

    const todayBreakdownSlices = pie(todayBreakdown, { value: "count" })
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
            radialText(
              [
                {
                  id: "total",
                  text: `${doneToday}/${scheduledToday.length}`,
                },
              ],
              {
                id: "today-breakdown-total",
                angle: 0,
                radius: 0,
                key: "id",
                text: "text",
                dy: -5,
                fill: "var(--foreground)",
                fontSize: 22,
                fontWeight: 700,
              },
            ),
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
          const point = points.find((candidate) =>
            breakdownDatum(candidate.datum),
          )
          const datum = point && breakdownDatum(point.datum)
          if (!point || !datum) return { rows: [] }
          return {
            title: datum.status === "completed" ? "Completed" : "Pending",
            rows: [
              {
                label: "Habits",
                value: String(datum.count),
                color: point.color,
              },
            ],
          }
        },
      },
    })

    const weeklyGoalBackground = pie(
      [{ id: "background", value: 1 }] as const,
      {
        value: "value",
      },
    )
    const weeklyGoalRows = [
      { metric: "completion", value: thisWeek.rate, ring: "completion" },
    ]
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
            range: [
              ({ radius }) => radius * 0.62,
              ({ radius }) => radius * 0.82,
            ],
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
        radialCenterLabel("weekly-goal", `${thisWeek.rate}%`, "of goal"),
      ],
      focus: focusGroupAngle,
      tooltip: {
        use: tooltip,
        content: () => ({
          rows: [
            {
              label: "Weekly goal",
              value: `${thisWeek.rate}%`,
              color: "var(--primary)",
            },
          ],
        }),
      },
    })

    const habitBalanceChart =
      habitBalance.length >= 3
        ? defineChart({
            marks: [
              polar({
                radiusRatio: 0.76,
                angle: {
                  scale: scalePoint<string>().domain(
                    habitBalance.map((row) => row.category),
                  ),
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
                  radialArea(habitBalance, {
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
        : null

    return {
      streakTrendChart,
      weeklyCheckinsChart,
      habitStreakBarChart,
      weeklyRateLineChart,
      streakHeatmapChart,
      todayBreakdownChart,
      weeklyGoalChart,
      habitBalanceChart,
    }
  }, [data])

  if (isLoading) {
    return (
      <>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-48 w-full" />
      </>
    )
  }

  if (habits.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChartColumnIcon />
          </EmptyMedia>
          <EmptyTitle>No insights yet</EmptyTitle>
          <EmptyDescription>
            Create a habit and check in for a few days to see trends here.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits/new" />}
          >
            <PlusIcon />
            New habit
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Current streak"
          description={`${data.strongest?.name ?? ""}, last 14 days`}
        >
          <div className="min-w-0">
            <Chart
              definition={charts.streakTrendChart}
              height={200}
              initialWidth={480}
              ariaLabel={`${data.strongest?.name ?? "Habit"} streak, last 14 days`}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Check-ins by habit"
          description="Times completed this week"
        >
          <div className="min-w-0">
            <Chart
              definition={charts.weeklyCheckinsChart}
              height={200}
              initialWidth={480}
              ariaLabel="Check-ins by habit, this week"
            />
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Year in check-ins"
        description="Habits completed per day, last 12 months"
      >
        <div className="min-w-0 overflow-x-auto">
          <Chart
            definition={charts.streakHeatmapChart}
            aspectRatio={6.466}
            style={{ minWidth: 1048 }}
            ariaLabel="Habits completed per day over the last 12 months"
          />
        </div>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Streaks by habit"
          description="Current streak length, per habit"
        >
          <div className="min-w-0">
            <Chart
              definition={charts.habitStreakBarChart}
              height={200}
              initialWidth={480}
              ariaLabel="Current streak length, per habit"
            />
          </div>
        </ChartCard>

        <ChartCard title="Weekly completion rate" description="Last 6 weeks">
          <div className="min-w-0">
            <Chart
              definition={charts.weeklyRateLineChart}
              height={200}
              initialWidth={480}
              ariaLabel="Weekly completion rate, last 6 weeks"
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Today's breakdown"
          description="Completed vs. pending"
          centered
        >
          <div className="mx-auto min-w-0 max-w-[220px]">
            <Chart
              definition={charts.todayBreakdownChart}
              height={200}
              initialWidth={220}
              ariaLabel={`${data.doneToday} of ${data.scheduledToday.length} habits completed today`}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Weekly goal"
          description="Target: 80% completion"
          centered
        >
          <div className="mx-auto min-w-0 max-w-[220px]">
            <Chart
              definition={charts.weeklyGoalChart}
              height={200}
              initialWidth={220}
              ariaLabel={`${data.thisWeek.rate}% of weekly goal`}
            />
          </div>
        </ChartCard>

        <ChartCard
          title="Habit balance"
          description="Completion by category, this week"
          centered
        >
          {charts.habitBalanceChart ? (
            <div className="mx-auto min-w-0 max-w-[240px]">
              <Chart
                definition={charts.habitBalanceChart}
                height={220}
                initialWidth={240}
                ariaLabel="Habit completion by category, this week"
              />
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Track habits in at least 3 categories to see your balance.
            </p>
          )}
        </ChartCard>
      </div>
    </>
  )
}
