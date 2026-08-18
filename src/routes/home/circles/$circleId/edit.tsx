import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { updateCircle, useCircle } from "@/hooks/use-circles"

export const Route = createFileRoute("/home/circles/$circleId/edit")({
  component: EditCirclePage,
})

function EditCirclePage() {
  const { circleId } = Route.useParams()
  const navigate = useNavigate()
  const circle = useCircle(circleId)

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
          render={
            <Link
              to="/home/circles/$circleId"
              params={{ circleId: circle.id }}
            />
          }
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
                  <Link
                    to="/home/circles/$circleId"
                    params={{ circleId: circle.id }}
                  />
                }
              >
                Cancel
              </Button>
            }
            onSubmit={async (input) => {
              updateCircle(circle.id, input)
              await navigate({
                to: "/home/circles/$circleId",
                params: { circleId: circle.id },
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
