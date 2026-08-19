import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link, useNavigate } from "@tanstack/react-router"
import { LogOutIcon, PencilIcon, UsersIcon } from "lucide-react"

import { memberRoles } from "@/actions/circles"
import { CircleAccessDenied } from "@/components/circles/circle-access-denied"
import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { useCirclesCollection } from "@/lib/collection/circles"
import { useOfflineExecutor } from "@/lib/db/offline"

export function CircleDetailHeader({ circleId }: { circleId: string }) {
  const navigate = useNavigate()
  const circlesCollection = useCirclesCollection()
  const executor = useOfflineExecutor()
  const user = useHomeUser()
  const { data: matches = [], isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
    [circleId],
  )
  const circle = matches.at(0)

  if (isLoading) {
    return <Skeleton className="h-8 w-64" />
  }

  if (!circle) {
    return <CircleAccessDenied />
  }

  const currentMember = circle.members.find(
    (member) => member.userId === user.id,
  )
  const currentRoles = currentMember ? memberRoles(currentMember.role) : []
  const canManage =
    currentRoles.includes("owner") || currentRoles.includes("admin")

  return (
    <PageHeader
      title={
        <span className="flex items-center gap-2">
          <CircleColorDot color={circle.color} className="size-3.5" />
          {circle.name}
        </span>
      }
      description={circle.description}
    >
      {canManage && (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link to="/home/circles/$circleId/edit" params={{ circleId }} />
          }
        >
          <PencilIcon />
          Edit
        </Button>
      )}
      <Button
        variant="destructive"
        size="sm"
        disabled={!executor}
        onClick={async () => {
          if (!executor) return
          executor
            .createOfflineTransaction({ mutationFnName: "circles.leave" })
            .mutate(() => {
              circlesCollection.delete(circle.id)
            })
          await navigate({ to: "/home/circles" })
        }}
      >
        <LogOutIcon />
        Leave circle
      </Button>
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
  )
}
