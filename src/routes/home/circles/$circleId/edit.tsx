import { useState } from "react"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { updateCircle } from "@/actions/circles"
import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { circleQueryOptions, circlesQueryOptions } from "@/lib/data/circles"

export const Route = createFileRoute("/home/circles/$circleId/edit")({
  component: EditCirclePage,
})

function EditCirclePage() {
  const { circleId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(circleQueryOptions(circleId))
  const [error, setError] = useState<string | null>(null)
  const circle = data.circle

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
            error={error}
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
              setError(null)
              const { error: updateError } = await updateCircle({
                data: { organizationId: circle.id, ...input },
              })
              if (updateError) {
                setError(updateError.message)
                return
              }
              await queryClient.invalidateQueries({
                queryKey: circleQueryOptions(circleId).queryKey,
              })
              await queryClient.invalidateQueries({
                queryKey: circlesQueryOptions().queryKey,
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
