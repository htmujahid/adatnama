import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  RefreshCwIcon,
  XCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { statusQueryOptions } from "@/lib/data/status"
import type { ComponentStatus } from "@/lib/data/status"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/status")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(statusQueryOptions())
  },
  component: StatusPage,
})

const overallCopy: Record<
  ComponentStatus,
  { label: string; description: string }
> = {
  operational: {
    label: "All Systems Operational",
    description: "Everything is running smoothly.",
  },
  degraded: {
    label: "Degraded Performance",
    description: "Some components are experiencing issues.",
  },
  outage: {
    label: "Major Outage",
    description: "One or more components are down.",
  },
}

const statusStyles: Record<
  ComponentStatus,
  {
    icon: typeof CheckCircle2Icon
    dot: string
    text: string
    badge: string
    label: string
  }
> = {
  operational: {
    icon: CheckCircle2Icon,
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    badge:
      "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Operational",
  },
  degraded: {
    icon: AlertTriangleIcon,
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    badge:
      "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Degraded",
  },
  outage: {
    icon: XCircleIcon,
    dot: "bg-destructive",
    text: "text-destructive",
    badge: "border-transparent bg-destructive/10 text-destructive",
    label: "Outage",
  },
}

function StatusPage() {
  const queryClient = useQueryClient()
  const { data, isFetching } = useSuspenseQuery(statusQueryOptions())
  const overall = statusStyles[data.status]
  const OverallIcon = overall.icon

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">System Status</h1>
          <p className="text-sm text-muted-foreground">
            Live status of Forming's services, refreshed automatically every
            30s.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh status"
          disabled={isFetching}
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: statusQueryOptions().queryKey,
            })
          }
        >
          <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <OverallIcon className={cn("size-6 shrink-0", overall.text)} />
            <div>
              <CardTitle>{overallCopy[data.status].label}</CardTitle>
              <CardDescription>
                {overallCopy[data.status].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ItemGroup>
            {data.components.map((component) => {
              const style = statusStyles[component.status]
              return (
                <Item key={component.name} variant="outline">
                  <ItemMedia>
                    <span className={cn("size-2.5 rounded-full", style.dot)} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{component.name}</ItemTitle>
                    <ItemDescription>
                      {component.latencyMs}ms response time
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Badge className={style.badge}>{style.label}</Badge>
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Last checked {format(new Date(data.timestamp), "PPpp")}
      </p>
    </main>
  )
}
