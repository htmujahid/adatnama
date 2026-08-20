import { createFileRoute, Link } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { NewHabitCard } from "@/components/habits/new/new-habit-card"
import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/home/habits/new")({
  component: NewHabitPage,
})

function NewHabitPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="New habit"
        description="Add something you want to track every day."
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

      <NewHabitCard />
    </div>
  )
}
