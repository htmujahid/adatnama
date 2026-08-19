import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link, useNavigate } from "@tanstack/react-router"

import { CircleForm } from "@/components/circles/circle-form"
import { CircleNotFound } from "@/components/circles/circle-not-found"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCirclesCollection } from "@/lib/collection/circles"
import { useOfflineExecutor } from "@/lib/db/offline"

export function EditCircleCard({ circleId }: { circleId: string }) {
  const navigate = useNavigate()
  const circlesCollection = useCirclesCollection()
  const executor = useOfflineExecutor()
  const { data: matches = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
  })
  const circle = matches.at(0)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-9 w-40" />
        </CardContent>
      </Card>
    )
  }

  if (!circle) {
    return <CircleNotFound />
  }

  return (
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
  )
}
