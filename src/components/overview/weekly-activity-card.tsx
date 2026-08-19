import { useLiveQuery } from "@tanstack/react-db"
import { format } from "date-fns"
import { ChartColumnIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import { dateKey, lastNDays, WEEK_LENGTH } from "@/lib/habits"
import { cn } from "@/lib/utils"

export function WeeklyActivityCard() {
  const { data: habits = [] } = useLiveQuery({
    query: (q) => q.from({ habit: habitsCollection }),
  })
  const { data: checkins = [] } = useLiveQuery({
    query: (q) => q.from({ checkin: checkinsCollection }),
  })

  const activeHabits = habits.filter((habit) => habit.archivedAt === null)
  const doneSlots = new Set(
    checkins
      .filter((checkin) => checkin.status === "done")
      .map((checkin) => `${checkin.habitId}|${checkin.date}`),
  )
  const weeklyDailyCounts = lastNDays(WEEK_LENGTH, new Date()).map((date) => {
    const key = dateKey(date)
    const count = activeHabits.filter((habit) =>
      doneSlots.has(`${habit.id}|${key}`),
    ).length
    return { date: format(date, "MMM d"), count }
  })
  const weeklyCheckins = weeklyDailyCounts.reduce(
    (sum, day) => sum + day.count,
    0,
  )
  const weeklyRate =
    activeHabits.length > 0
      ? Math.round((weeklyCheckins / (WEEK_LENGTH * activeHabits.length)) * 100)
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your week</CardTitle>
        <CardDescription>
          {weeklyCheckins} check-ins · {weeklyRate}% completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        {weeklyCheckins === 0 ? (
          <Empty className="gap-2 p-4">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="mb-1 size-8 [&_svg:not([class*='size-'])]:size-4"
              >
                <ChartColumnIcon />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No activity this week</EmptyTitle>
              <EmptyDescription className="text-xs">
                {activeHabits.length > 0
                  ? "Check in on a habit to see your week fill up."
                  : "Create a habit to start tracking your week."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
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
                      title={`${day.date}: ${day.count} of ${activeHabits.length} habits`}
                      className={cn(
                        "w-full rounded-t-sm",
                        isToday ? "bg-primary" : "bg-primary/60",
                      )}
                      style={{
                        height: `${activeHabits.length > 0 ? (day.count / activeHabits.length) * 100 : 0}%`,
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
        )}
      </CardContent>
    </Card>
  )
}
