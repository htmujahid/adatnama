import { safeRandomUUID } from "@tanstack/react-db"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { HabitForm } from "@/components/habits/habit-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { usePreferences } from "@/hooks/use-preferences"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"

export const Route = createFileRoute("/home/habits/new")({
  component: NewHabitPage,
})

function NewHabitPage() {
  const navigate = useNavigate()
  const user = useHomeUser()
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()
  const { habitDefaults, isLoading } = usePreferences()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            New habit
          </h1>
          <p className="text-sm text-muted-foreground">
            Add something you want to track every day.
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

      <Card>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-1/2" />
            </div>
          ) : (
            <HabitForm
              defaultValues={{
                name: "",
                description: "",
                categoryId: habitDefaults.category ?? "",
                days: habitDefaults.days,
                target: "",
                reminderTime: "",
                freezesTotal: habitDefaults.freezesTotal,
              }}
              submitLabel="Create habit"
              cancel={
                <Button
                  type="button"
                  variant="outline"
                  nativeButton={false}
                  render={<Link to="/home/habits" />}
                >
                  Cancel
                </Button>
              }
              onSubmit={async (input) => {
                if (!executor) return
                const id = safeRandomUUID()
                const now = new Date().toISOString()
                executor
                  .createOfflineTransaction({ mutationFnName: "habits.create" })
                  .mutate(() => {
                    habitsCollection.insert({
                      id,
                      userId: user.id,
                      categoryId: input.categoryId,
                      name: input.name,
                      description: input.description,
                      target: input.target,
                      reminderTime: input.reminderTime,
                      freezesTotal: input.freezesTotal,
                      days: [...input.days],
                      startedAt: now,
                      archivedAt: null,
                      archivedNote: null,
                      createdAt: now,
                      updatedAt: now,
                    })
                  })
                await navigate({
                  to: "/home/habits/$habitId",
                  params: { habitId: id },
                })
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
