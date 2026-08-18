import { createFileRoute } from "@tanstack/react-router"

import { computeStatus } from "@/lib/query/status"

export const Route = createFileRoute("/api/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const body = await computeStatus(request.headers.get("cf-ray"))
        return Response.json(body)
      },
    },
  },
})
