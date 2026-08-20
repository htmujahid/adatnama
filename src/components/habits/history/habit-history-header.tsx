import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { HabitNotFound } from "@/components/habits/habit-not-found"
import { habitStatus, STATUS_META } from "@/components/habits/habit-status"
import { PageHeader } from "@/components/layouts/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"

export function HabitHistoryHeader({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const { data: rows = [], isLoading } = useLiveQuery({
    query: (q) =>
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
  })
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)

  if (isLoading && !habit) {
    return (
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-5 w-24 rounded-full" />
      </div>
    )
  }

  if (!habit) {
    return <HabitNotFound />
  }

  const statusMeta = STATUS_META[habitStatus(habit)]

  return (
    <PageHeader
      title={
        <span className="flex items-center gap-2">
          {habit.name} history
          <Badge variant={statusMeta.badgeVariant}>
            <statusMeta.icon />
            {statusMeta.label}
          </Badge>
        </span>
      }
      description="Every check-in recorded for this habit."
    >
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <Link to="/home/habits/$habitId" params={{ habitId: habit.id }} />
        }
      >
        <ArrowLeftIcon />
        Back to habit
      </Button>
    </PageHeader>
  )
}
