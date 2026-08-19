import { eq, useLiveQuery } from "@tanstack/react-db"

import { HISTORY_LEGEND, HistoryGrid } from "@/components/habits/habit-history"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"
import { cn } from "@/lib/utils"

export function HabitHistoryCard({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
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
      .where(({ habit }) => eq(habit.id, habitId)),
  )
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)

  if (isLoading && !habit) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!habit) {
    return null
  }

  return (
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
                <span className={cn("size-2.5 rounded-sm", item.className)} />
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
  )
}
