import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { createCircle } from "@/actions/circles"
import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PRESET_COLORS } from "@/lib/colors"
import { circlesQueryOptions } from "@/lib/data/circles"

export const Route = createFileRoute("/home/circles/new")({
  component: NewCirclePage,
})

function NewCirclePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

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
              color: PRESET_COLORS[0].value,
            }}
            submitLabel="Create circle"
            error={error}
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
              setError(null)
              const { error: createError, circle } = await createCircle({
                data: input,
              })
              if (createError) {
                setError(createError.message)
                return
              }
              await queryClient.invalidateQueries({
                queryKey: circlesQueryOptions().queryKey,
              })
              await navigate({
                to: "/home/circles/$circleId",
                params: { circleId: circle.slug },
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
