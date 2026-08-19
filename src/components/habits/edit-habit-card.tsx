import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link, useNavigate } from "@tanstack/react-router"

import {
  HabitForm,
  reminderTimeToInputValue,
} from "@/components/habits/habit-form"
import { HabitNotFound } from "@/components/habits/habit-not-found"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"

export function EditHabitCard({ habitId }: { habitId: string }) {
  const navigate = useNavigate()
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()
  const { data: habit, isLoading } = useLiveQuery((q) =>
    q
      .from({ habits: habitsCollection })
      .where(({ habits }) => eq(habits.id, habitId))
      .findOne(),
  )

  if (isLoading && !habit) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (!habit) {
    return <HabitNotFound />
  }

  return (
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
  )
}
