import { createFileRoute, Outlet } from "@tanstack/react-router"

import { circleQueryOptions } from "@/lib/data/circles"

export const Route = createFileRoute("/home/circles/$circleId")({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      circleQueryOptions(params.circleId),
    )
  },
  component: () => <Outlet />,
})
