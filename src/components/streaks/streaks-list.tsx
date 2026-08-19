import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { CalendarDaysIcon, FlameIcon, MedalIcon, PlusIcon } from "lucide-react"

import { CategoryBadge } from "@/components/categories/category-badge"
import {
  FreezePips,
  HISTORY_LEGEND,
  HistoryGrid,
} from "@/components/habits/habit-history"
import {
  habitStatus,
  MILESTONES,
  STATUS_META,
} from "@/components/habits/habit-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"
import { cn } from "@/lib/utils"

export function StreaksList() {
  const { data: rows = [], isLoading } = useLiveQuery((q) =>
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
  const habits = foldHabitCheckinRows(rows, new Date())

  const streaks = [...habits].sort(
    (a, b) => b.streak - a.streak || b.longestStreak - a.longestStreak,
  )

  return (
    <>
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

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1.5 h-5 w-20 rounded-full" />
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : streaks.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FlameIcon />
            </EmptyMedia>
            <EmptyTitle>No streaks yet</EmptyTitle>
            <EmptyDescription>
              Create a habit and check in to start your first streak.
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
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {streaks.map((habit) => {
            const status = habitStatus(habit)
            const statusMeta = STATUS_META[status]

            return (
              <Card
                key={habit.id}
                className={cn(status === "broken" && "border-destructive/30")}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                      <CardTitle>{habit.name}</CardTitle>
                      {habit.categoryId && (
                        <CategoryBadge categoryId={habit.categoryId} />
                      )}
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
                        day{habit.streak === 1 ? "" : "s"}
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

                  <HistoryGrid
                    history={habit.history}
                    cellClassName="size-2.5"
                  />

                  <div className="flex items-center justify-between">
                    <FreezePips
                      total={habit.freezesTotal}
                      left={habit.freezesLeft}
                    />
                    <span className="text-xs text-muted-foreground">
                      {habit.freezesLeft} of {habit.freezesTotal} freezes left
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {MILESTONES.map((days) => {
                      const achieved = habit.longestStreak >= days
                      return (
                        <Badge
                          key={days}
                          variant={achieved ? "secondary" : "outline"}
                          className={cn(
                            !achieved && "text-muted-foreground/60",
                          )}
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
      )}
    </>
  )
}
