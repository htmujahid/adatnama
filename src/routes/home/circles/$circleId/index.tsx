import { createFileRoute } from "@tanstack/react-router"

import { CircleDetailHeader } from "@/components/circles/circle-detail-header"
import { CircleInviteCard } from "@/components/circles/circle-invite-card"
import { CircleMembersCard } from "@/components/circles/circle-members-card"

export const Route = createFileRoute("/home/circles/$circleId/")({
  component: CircleDetailPage,
})

function CircleDetailPage() {
  const { circleId } = Route.useParams()
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CircleDetailHeader circleId={circleId} />
      <CircleInviteCard circleId={circleId} />
      <CircleMembersCard circleId={circleId} />
    </div>
  )
}
