import { createFileRoute } from "@tanstack/react-router"

import { JoinCircleCard } from "@/components/circles/join-circle-card"
import { circlePreviewCollection } from "@/lib/collection/circles"

export const Route = createFileRoute("/home/circles/join/$code")({
  loader: async ({ context, params }) => {
    await context.dbClient
      .collection(circlePreviewCollection(params.code))
      .toArrayWhenReady()
  },
  component: JoinCirclePage,
})

function JoinCirclePage() {
  const { code } = Route.useParams()
  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <JoinCircleCard code={code} />
    </div>
  )
}
