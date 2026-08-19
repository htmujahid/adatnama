import { createFileRoute } from "@tanstack/react-router"

import { JoinCircleCard } from "@/components/circles/join-circle-card"
import { circlePreviewQueryOptions } from "@/lib/query/circles"

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
  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <JoinCircleCard code={code} />
    </div>
  )
}
