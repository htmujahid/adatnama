import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import {
  HabitForm,
  reminderTimeToInputValue,
} from "@/components/habits/habit-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useHabit } from "@/hooks/use-habits"
import { habitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"

export const Route = createFileRoute("/home/habits/$habitId/edit")({
  component: EditHabitPage,
})

function EditHabitPage() {
  const { habitId } = Route.useParams()
  const navigate = useNavigate()
  const { habit, isLoading } = useHabit(habitId)
  const executor = useOfflineExecutor()

  if (isLoading && !habit) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!habit) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Habit not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This habit doesn't exist or may have been removed.
        </p>
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
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Edit {habit.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the details for this habit.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link to="/home/habits/$habitId" params={{ habitId: habit.id }} />
          }
        >
          <ListChecksIcon />
          Back to habit
        </Button>
      </div>

      <Card>
        <CardContent>
          <HabitForm
            defaultValues={{
              name: habit.name,
              description: habit.description,
              categoryId: habit.categoryId ?? "",
              days: habit.days,
              target: habit.target,
              reminderTime: reminderTimeToInputValue(habit.reminderTime),
              freezesTotal: habit.freezesTotal,
            }}
            submitLabel="Save changes"
            cancel={
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    to="/home/habits/$habitId"
                    params={{ habitId: habit.id }}
                  />
                }
              >
                Cancel
              </Button>
            }
            onSubmit={async (input) => {
              if (!executor) return
              executor
                .createOfflineTransaction({ mutationFnName: "habits.update" })
                .mutate(() => {
                  habitsCollection.update(habit.id, (draft) => {
                    draft.categoryId = input.categoryId
                    draft.name = input.name
                    draft.description = input.description
                    draft.target = input.target
                    draft.reminderTime = input.reminderTime
                    draft.freezesTotal = input.freezesTotal
                    draft.days = [...input.days]
                    draft.updatedAt = new Date().toISOString()
                  })
                })
              await navigate({
                to: "/home/habits/$habitId",
                params: { habitId: habit.id },
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
