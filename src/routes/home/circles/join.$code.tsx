import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { findCircleByInviteCode, joinCircle } from "@/hooks/use-circles"

export const Route = createFileRoute("/home/circles/join/$code")({
  component: JoinCirclePage,
})

function JoinCirclePage() {
  const { code } = Route.useParams()
  const navigate = useNavigate()
  const circle = findCircleByInviteCode(code)

  if (!circle) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Invalid invite link
        </h1>
        <p className="text-sm text-muted-foreground">
          This invite code doesn't match any circle. It may have been
          regenerated.
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/circles" />}
        >
          <UsersIcon />
          All circles
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            You're invited to join
          </p>
          <div className="flex items-center gap-2">
            <CircleColorDot color={circle.color} className="size-3.5" />
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {circle.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">{circle.description}</p>
          <p className="text-xs text-muted-foreground">
            {circle.members.length} member
            {circle.members.length === 1 ? "" : "s"}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              onClick={async () => {
                joinCircle(circle.id)
                await navigate({
                  to: "/home/circles/$circleId",
                  params: { circleId: circle.id },
                })
              }}
            >
              Join circle
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="/home/circles" />}
            >
              All circles
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
