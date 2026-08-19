import { createFileRoute, Link } from "@tanstack/react-router"
import { ArchiveIcon, PlusIcon } from "lucide-react"

import { DailyHabitsCard } from "@/components/habits/daily-habits-card"
import { HabitsList } from "@/components/habits/habits-list"
import { RemindersCard } from "@/components/habits/reminders-card"
import { TotalHabitsCard } from "@/components/habits/total-habits-card"
import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/home/habits/")({
  component: HabitsPage,
})

function HabitsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Habits"
        description="Everything you're tracking, in one place."
      >
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
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <TotalHabitsCard />
        <DailyHabitsCard />
        <RemindersCard />
      </div>

      <HabitsList />
    </div>
  )
}
