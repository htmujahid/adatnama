import { queryOptions } from "@tanstack/react-query"
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

export const statusQueryOptions = () =>
  queryOptions({
    queryKey: ["status"],
    queryFn: () => getStatusFn(),
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
