import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatCard({
  label,
  value,
  badge,
  icon: Icon,
  isLoading,
}: {
  label: string
  value: string
  badge: string
  icon: LucideIcon
  isLoading: boolean
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {isLoading ? <Skeleton className="h-8 w-24" /> : value}
        </CardTitle>
        <CardAction>
          <Badge variant="secondary">
            <Icon />
            {badge}
          </Badge>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
