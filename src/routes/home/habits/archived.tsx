import { createFileRoute, Link } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  FlameIcon,
  ListChecksIcon,
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
import { Skeleton } from "@/components/ui/skeleton"
import { useHabits } from "@/hooks/use-habits"
import { useCollection } from "@/lib/data/collection"
import { getHabitsCollection } from "@/lib/data/habits"
import { useOfflineExecutor } from "@/lib/db/offline"

export const Route = createFileRoute("/home/habits/archived")({
  component: ArchivedHabitsPage,
})

function ArchivedHabitsPage() {
  const { habits, checkins, isLoading } = useHabits()
  const collection = useCollection(getHabitsCollection)
  const executor = useOfflineExecutor()
  const archived = habits.filter((habit) => habit.archivedAt !== null)

  function restore(habitId: string) {
    if (!collection || !executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "habits.restore" })
      .mutate(() => {
        collection.update(habitId, (draft) => {
          draft.archivedAt = null
          draft.archivedNote = null
        })
      })
  }

  function remove(habitId: string) {
    if (!collection || !executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "habits.delete" })
      .mutate(() => {
        collection.delete(habitId)
      })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Archived habits
          </h1>
          <p className="text-sm text-muted-foreground">
            Habits you've paused or retired. Nothing here counts toward your
            current streaks.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/habits" />}
        >
          <ListChecksIcon />
          All habits
        </Button>
      </div>

      {isLoading ? (
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
      ) : archived.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            You haven't archived any habits yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {archived.map((habit) => {
            const daysTracked = checkins.filter(
              (checkin) =>
                checkin.habitId === habit.id && checkin.status === "done",
            ).length

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
      )}
    </div>
  )
}
