import { createFileRoute } from "@tanstack/react-router"

import { CircleDetailHeader } from "@/components/circles/circle-detail-header"
import { CircleInviteCard } from "@/components/circles/circle-invite-card"
import { CircleMembersCard } from "@/components/circles/circle-members-card"
import { CircleSharedHabitsCard } from "@/components/circles/circle-shared-habits-card"
import { OfflineScreen } from "@/components/pwa/offline-screen"
import { useOnlineStatus } from "@/hooks/use-online-status"

export const Route = createFileRoute("/home/circles/$circleId/")({
  component: CircleDetailPage,
})

function CircleDetailPage() {
  const { circleId } = Route.useParams()
  const online = useOnlineStatus()

  if (!online) {
    return (
      <OfflineScreen description="Circle details need a connection. Reconnect to see your circle's shared habits and members." />
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CircleDetailHeader circleId={circleId} />
      <CircleInviteCard circleId={circleId} />
      <CircleSharedHabitsCard circleId={circleId} />
      <CircleMembersCard circleId={circleId} />
    </div>
  )
}
