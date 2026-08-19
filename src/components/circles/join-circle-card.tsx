import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"

import { joinCircleByCode } from "@/actions/circles"
import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { CircleInviteInvalid } from "@/components/circles/circle-invite-invalid"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useCirclesCollection } from "@/lib/collection/circles"
import { circlePreviewQueryOptions } from "@/lib/query/circles"

export function JoinCircleCard({ code }: { code: string }) {
  const navigate = useNavigate()
  const circlesCollection = useCirclesCollection()
  const { data } = useSuspenseQuery(circlePreviewQueryOptions(code))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const circle = data.circle

  if (!circle) {
    return <CircleInviteInvalid />
  }

  return (
    <div className="flex w-full flex-col items-center gap-3 py-24 text-center">
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
            {circle.memberCount === 1
              ? "1 member"
              : `${circle.memberCount} members`}
          </p>
          <FieldError>{error}</FieldError>
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={async () => {
                setPending(true)
                setError(null)
                const { error: joinError, slug } = await joinCircleByCode({
                  data: { code },
                })
                setPending(false)
                if (joinError || !slug) {
                  setError(joinError?.message ?? "Unable to join circle.")
                  return
                }
                await circlesCollection.utils.refetch()
                await navigate({
                  to: "/home/circles/$circleId",
                  params: { circleId: slug },
                })
              }}
            >
              {pending && <Spinner data-icon="inline-start" />}
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
