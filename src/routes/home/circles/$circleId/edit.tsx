import { createFileRoute } from "@tanstack/react-router"

import { EditCircleCard } from "@/components/circles/edit-circle-card"
import { EditCircleHeader } from "@/components/circles/edit-circle-header"

export const Route = createFileRoute("/home/circles/$circleId/edit")({
  component: EditCirclePage,
})

function EditCirclePage() {
  const { circleId } = Route.useParams()
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <EditCircleHeader circleId={circleId} />
      <EditCircleCard circleId={circleId} />
    </div>
  )
}
