import { useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useCirclesCollection } from "@/lib/collection/circles"

export function CirclesList() {
  const circlesCollection = useCirclesCollection()
  const { data: circles = [], isLoading } = useLiveQuery((q) =>
    q.from({ circle: circlesCollection }),
  )

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="size-3 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="mt-1.5 h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (circles.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon />
          </EmptyMedia>
          <EmptyTitle>No circles yet</EmptyTitle>
          <EmptyDescription>
            Create one, or use "Join a circle" with an invite code.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {circles.map((circle) => (
        <Card key={circle.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CircleColorDot color={circle.color} className="size-3" />
              <CardTitle>{circle.name}</CardTitle>
            </div>
            <CardDescription className="line-clamp-1">
              {circle.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <span className="text-xs text-muted-foreground">
              {circle.members.length === 1
                ? "1 member"
                : `${circle.members.length} members`}
            </span>

            <Link
              to="/home/circles/$circleId"
              params={{ circleId: circle.slug }}
              className="text-xs font-medium text-primary hover:underline"
            >
              View circle
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
