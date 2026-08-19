import { safeRandomUUID } from "@tanstack/react-db"
import { Link, useNavigate } from "@tanstack/react-router"

import { CircleForm } from "@/components/circles/circle-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useHomeUser } from "@/hooks/use-home-user"
import { useCirclesCollection } from "@/lib/collection/circles"
import { PRESET_COLORS } from "@/lib/colors"
import { useOfflineExecutor } from "@/lib/db/offline"
import { slugify } from "@/lib/slug"

export function NewCircleCard() {
  const navigate = useNavigate()
  const circlesCollection = useCirclesCollection()
  const executor = useOfflineExecutor()
  const user = useHomeUser()

  return (
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
  )
}
