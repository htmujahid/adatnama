import { useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { circlesCollection } from "@/lib/collection/circles"

export function CirclesSummaryCard() {
  const { data: circles = [], isLoading } = useLiveQuery((q) =>
    q.from({ circle: circlesCollection }),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circles</CardTitle>
        <CardDescription>Shared streaks with your people</CardDescription>
        <CardAction>
          <Link
            to="/home/circles"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : circles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven't joined a circle yet.
          </p>
        ) : (
          <ItemGroup>
            {circles.map((circle) => (
              <Item key={circle.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>
                    <CircleColorDot color={circle.color} />
                    {circle.name}
                  </ItemTitle>
                  <ItemDescription>
                    {circle.members.length === 1
                      ? "1 member"
                      : `${circle.members.length} members`}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
