import { safeRandomUUID, useLiveQuery } from "@tanstack/react-db"
import { Link, useNavigate } from "@tanstack/react-router"

import { HabitForm } from "@/components/habits/habit-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { useHabitsCollection } from "@/lib/collection/habits"
import { preferencesCollection } from "@/lib/collection/preferences"
import { useOfflineExecutor } from "@/lib/db/offline"
import { habitDefaultsFrom } from "@/lib/preferences"

export function NewHabitCard() {
  const navigate = useNavigate()
  const user = useHomeUser()
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()
  const { data: preferenceRows = [], isLoading } = useLiveQuery((q) =>
    q.from({ preferences: preferencesCollection }),
  )
  const habitDefaults = habitDefaultsFrom(
    preferenceRows.find((row) => row.userId === user.id),
  )

  return (
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
              categoryId: "",
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
  )
}
