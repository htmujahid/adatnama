import { createFileRoute, Link } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { ArchivedHabitsList } from "@/components/habits/list/archived-habits-list"
import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/home/habits/archived")({
  component: ArchivedHabitsPage,
})

function ArchivedHabitsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Archived habits"
        description="Habits you've paused or retired. Nothing here counts toward your current streaks."
      >
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/habits" />}
        >
          <ListChecksIcon />
          All habits
        </Button>
      </PageHeader>

      <ArchivedHabitsList />
    </div>
  )
}
