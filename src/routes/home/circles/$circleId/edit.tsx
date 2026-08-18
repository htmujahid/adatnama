import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { circlesCollection } from "@/lib/collection/circles"
import { useOfflineExecutor } from "@/lib/db/offline"

export const Route = createFileRoute("/home/circles/$circleId/edit")({
  component: EditCirclePage,
})

function EditCircleSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-9 w-40" />
        </CardContent>
      </Card>
    </div>
  )
}

function EditCirclePage() {
  const { circleId } = Route.useParams()
  const navigate = useNavigate()
  const executor = useOfflineExecutor()
  const { data: matches = [], isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
    [circleId],
  )
  const circle = matches.at(0)

  if (isLoading) {
    return <EditCircleSkeleton />
  }

  if (!circle) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Circle not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This circle doesn't exist or may have been removed.
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Edit {circle.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update the details for this circle.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/circles/$circleId" params={{ circleId }} />}
        >
          <UsersIcon />
          Back to circle
        </Button>
      </div>

      <Card>
        <CardContent>
          <CircleForm
            defaultValues={{
              name: circle.name,
              description: circle.description,
              color: circle.color,
            }}
            submitLabel="Save changes"
            cancel={
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={
                  <Link to="/home/circles/$circleId" params={{ circleId }} />
                }
              >
                Cancel
              </Button>
            }
            onSubmit={async (input) => {
              if (!executor) return
              executor
                .createOfflineTransaction({ mutationFnName: "circles.update" })
                .mutate(() => {
                  circlesCollection.update(circle.id, (draft) => {
                    draft.name = input.name
                    draft.description = input.description
                    draft.color = input.color
                  })
                })
              await navigate({
                to: "/home/circles/$circleId",
                params: { circleId },
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
