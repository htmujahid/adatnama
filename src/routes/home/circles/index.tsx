import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

import { CirclesList } from "@/components/circles/circles-list"
import { JoinCircleDialog } from "@/components/circles/join-circle-dialog"
import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/home/circles/")({
  component: CirclesPage,
})

function CirclesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Circles"
        description="Shared streaks with your people."
      >
        <JoinCircleDialog />
        <Button
          size="sm"
          nativeButton={false}
          render={<Link to="/home/circles/new" />}
        >
          <PlusIcon />
          New circle
        </Button>
      </PageHeader>

      <CirclesList />
    </div>
  )
}
