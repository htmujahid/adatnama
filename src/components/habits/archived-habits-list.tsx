import { eq, useLiveQuery } from "@tanstack/react-db"
import { format, parseISO } from "date-fns"
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  FlameIcon,
  Trash2Icon,
} from "lucide-react"

import { CategoryBadge } from "@/components/categories/category-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"
import { foldHabitCheckinRows } from "@/lib/habits"

export function ArchivedHabitsList() {
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()
  const today = new Date()
  const { data: rows = [], isLoading } = useLiveQuery((q) =>
    q.from({ habit: habitsCollection }).leftJoin(
      {
        checkin: q
          .from({ checkin: checkinsCollection })
          .where(({ checkin }) => eq(checkin.status, "done")),
      },
      ({ habit, checkin }) => eq(checkin.habitId, habit.id),
    ),
  )
  const habits = foldHabitCheckinRows(rows, today)
  const archived = habits.filter((habit) => habit.archivedAt !== null)
  const doneCountByHabitId = new Map<string, number>()
  for (const { habit, checkin } of rows) {
    if (!checkin) continue
    doneCountByHabitId.set(
      habit.id,
      (doneCountByHabitId.get(habit.id) ?? 0) + 1,
    )
  }

  function restore(habitId: string) {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "habits.restore" })
      .mutate(() => {
        habitsCollection.update(habitId, (draft) => {
          draft.archivedAt = null
          draft.archivedNote = null
        })
      })
  }

  function remove(habitId: string) {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "habits.delete" })
      .mutate(() => {
        habitsCollection.delete(habitId)
      })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1.5 h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (archived.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ArchiveIcon />
          </EmptyMedia>
          <EmptyTitle>No archived habits</EmptyTitle>
          <EmptyDescription>
            You haven't archived any habits yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {archived.map((habit) => {
        const daysTracked = doneCountByHabitId.get(habit.id) ?? 0

        return (
          <Card key={habit.id} className="opacity-80">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1.5">
                  <CardTitle>{habit.name}</CardTitle>
                  {habit.categoryId ? (
                    <CategoryBadge categoryId={habit.categoryId} />
                  ) : (
                    <CardDescription>Uncategorized</CardDescription>
                  )}
                </div>
                <Badge variant="outline">
                  <ArchiveIcon />
                  Archived{" "}
                  {habit.archivedAt
                    ? format(parseISO(habit.archivedAt), "MMM d")
                    : ""}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {habit.archivedNote && (
                <p className="text-sm text-muted-foreground">
                  {habit.archivedNote}
                </p>
              )}
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <FlameIcon className="size-4 text-muted-foreground" />
                  <span className="font-semibold tabular-nums">
                    {habit.longestStreak}
                  </span>
                  <span className="text-muted-foreground">day best</span>
                </span>
                <span className="text-muted-foreground">
                  Tracked {daysTracked} day{daysTracked === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restore(habit.id)}
                >
                  <ArchiveRestoreIcon />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(habit.id)}
                >
                  <Trash2Icon />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
