import { safeRandomUUID } from "@tanstack/react-db"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useHomeUser } from "@/hooks/use-home-user"
import { PRESET_COLORS } from "@/lib/colors"
import { circlesCollection } from "@/lib/collection/circles"
import { useOfflineExecutor } from "@/lib/db/offline"
import { slugify } from "@/lib/slug"

export const Route = createFileRoute("/home/circles/new")({
  component: NewCirclePage,
})

function NewCirclePage() {
  const navigate = useNavigate()
  const executor = useOfflineExecutor()
  const user = useHomeUser()

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
              if (!executor) return
              const id = safeRandomUUID()
              const slug = slugify(input.name)
              executor
                .createOfflineTransaction({ mutationFnName: "circles.create" })
                .mutate(() => {
                  circlesCollection.insert({
                    id,
                    name: input.name,
                    description: input.description,
                    color: input.color,
                    slug,
                    joinCode: safeRandomUUID()
                      .replace(/-/g, "")
                      .slice(0, 8)
                      .toUpperCase(),
                    members: [
                      {
                        id: safeRandomUUID(),
                        userId: user.id,
                        role: "owner",
                        name: user.name,
                      },
                    ],
                  })
                })
              await navigate({
                to: "/home/circles/$circleId",
                params: { circleId: slug },
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
