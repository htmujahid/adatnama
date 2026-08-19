import { createFileRoute, Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { NewCircleCard } from "@/components/circles/new-circle-card"
import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/home/circles/new")({
  component: NewCirclePage,
})

function NewCirclePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="New circle"
        description="Start a circle to share streaks with your people."
      >
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/circles" />}
        >
          <UsersIcon />
          All circles
        </Button>
      </PageHeader>

      <NewCircleCard />
    </div>
  )
}
