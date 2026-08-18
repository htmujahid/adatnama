import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { joinCircleByCode } from "@/actions/circles"
import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  circlePreviewQueryOptions,
  getCirclesCollection,
} from "@/lib/data/circles"
import { useCollection } from "@/lib/data/collection"

export const Route = createFileRoute("/home/circles/join/$code")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      circlePreviewQueryOptions(params.code),
    )
  },
  component: JoinCirclePage,
})

function JoinCirclePage() {
  const { code } = Route.useParams()
  const navigate = useNavigate()
  const collection = useCollection(getCirclesCollection)
  const { data } = useSuspenseQuery(circlePreviewQueryOptions(code))
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const circle = data.circle

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
                await collection?.utils.refetch()
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
