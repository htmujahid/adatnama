import { collectionOptions } from "@tanstack/db"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeader } from "@tanstack/react-start/server"

export type ComponentStatus = "operational" | "degraded" | "outage"

export interface StatusComponent {
  name: string
  status: ComponentStatus
  latencyMs: number
}

export interface StatusResponse {
  status: ComponentStatus
  timestamp: string
  components: Array<StatusComponent>
}

export type StatusRecord = StatusResponse & { id: "status" }

async function checkComponent(
  name: string,
  check: () => ComponentStatus | Promise<ComponentStatus>,
): Promise<StatusComponent> {
  const start = Date.now()
  let status: ComponentStatus
  try {
    status = await check()
  } catch {
    status = "outage"
  }
  return { name, status, latencyMs: Date.now() - start }
}

export async function computeStatus(
  cfRay: string | null,
): Promise<StatusResponse> {
  const components = await Promise.all([
    checkComponent("API", () => "operational"),
    checkComponent("Website", () => "operational"),
    checkComponent("Edge Network", () => (cfRay ? "operational" : "degraded")),
  ])

  const status: ComponentStatus = components.some(
    (component) => component.status === "outage",
  )
    ? "outage"
    : components.some((component) => component.status === "degraded")
      ? "degraded"
      : "operational"

  return { status, timestamp: new Date().toISOString(), components }
}

const getStatusFn = createServerFn({ method: "GET" }).handler(() =>
  computeStatus(getRequestHeader("cf-ray") ?? null),
)

export const statusCollection = collectionOptions("status", (client) =>
  queryCollectionOptions({
    id: "status",
    queryKey: ["status"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    getKey: (status: StatusRecord) => status.id,
    queryFn: async () => {
      const response = await getStatusFn()
      return [{ id: "status" as const, ...response }]
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  }),
)

export function useStatusCollection() {
  return useDbClient().collection(statusCollection)
}

export type StatusCollection = ReturnType<typeof useStatusCollection>
