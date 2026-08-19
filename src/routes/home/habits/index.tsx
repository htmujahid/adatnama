import { createFileRoute, Link } from "@tanstack/react-router"
import { ArchiveIcon, PlusIcon } from "lucide-react"

import { DailyHabitsCard } from "@/components/habits/daily-habits-card"
import { HabitsList } from "@/components/habits/habits-list"
import { RemindersCard } from "@/components/habits/reminders-card"
import { TotalHabitsCard } from "@/components/habits/total-habits-card"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/home/habits/")({
  component: HabitsPage,
})

function HabitsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Habits
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything you're tracking, in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits/archived" />}
          >
            <ArchiveIcon />
            Archived
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits/new" />}
          >
            <PlusIcon />
            New habit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TotalHabitsCard />
        <DailyHabitsCard />
        <RemindersCard />
      </div>

      <HabitsList />
    </div>
  )
}
