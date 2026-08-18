import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { HabitForm } from "@/components/habits/habit-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createHabit } from "@/hooks/use-habit-catalog"
import { usePreferences } from "@/hooks/use-preferences"

export const Route = createFileRoute("/home/habits/new")({
  component: NewHabitPage,
})

function NewHabitPage() {
  const navigate = useNavigate()
  const { habitDefaults } = usePreferences()

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
          <HabitForm
            defaultValues={{
              name: "",
              description: "",
              category: habitDefaults.category ?? "",
              frequency: habitDefaults.frequency,
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
              const habit = createHabit(input)
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
