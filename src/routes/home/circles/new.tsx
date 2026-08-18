import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createCircle } from "@/hooks/use-circles"
import { CIRCLE_COLORS } from "@/routes/home/-circles-data"

export const Route = createFileRoute("/home/circles/new")({
  component: NewCirclePage,
})

function NewCirclePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            New circle
          </h1>
          <p className="text-sm text-muted-foreground">
            Start a circle to share streaks with your people.
          </p>
        </div>
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

      <Card>
        <CardContent>
          <CircleForm
            defaultValues={{
              name: "",
              description: "",
              color: CIRCLE_COLORS[0].value,
            }}
            submitLabel="Create circle"
            cancel={
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={<Link to="/home/circles" />}
              >
                Cancel
              </Button>
            }
            onSubmit={async (input) => {
              const circle = createCircle(input)
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
