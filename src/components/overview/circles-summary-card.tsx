import { useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
          <Empty className="gap-2 p-4">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="mb-1 size-8 [&_svg:not([class*='size-'])]:size-4"
              >
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No circles yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                You haven't joined a circle yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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
