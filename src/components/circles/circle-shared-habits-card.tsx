import { useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useQuery } from "@tanstack/react-query"
import {
  CircleCheckIcon,
  CopyIcon,
  FlameIcon,
  ListChecksIcon,
} from "lucide-react"

import { duplicateCircleHabit } from "@/actions/circle-habits"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { FieldError } from "@/components/ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { useCirclesCollection } from "@/lib/collection/circles"
import { useHabitsCollection } from "@/lib/collection/habits"
import { formatHabitDays } from "@/lib/habits"
import { circleHabitsQueryOptions } from "@/lib/query/circles"

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function CircleSharedHabitsCard({ circleId }: { circleId: string }) {
  const user = useHomeUser()
  const circlesCollection = useCirclesCollection()
  const habitsCollection = useHabitsCollection()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: matches = [] } = useLiveQuery({
    query: (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
  })
  const circle = matches.at(0)
  const { data: ownHabits = [] } = useLiveQuery({
    query: (q) => q.from({ habit: habitsCollection }),
  })
  const { data: members, isLoading } = useQuery({
    ...circleHabitsQueryOptions(circle?.id ?? ""),
    enabled: circle !== undefined,
  })

  if (!circle) {
    return null
  }

  async function duplicate(habitId: string) {
    if (!circle) return
    setPendingId(habitId)
    setError(null)
    const { error: duplicateError } = await duplicateCircleHabit({
      data: { habitId, organizationId: circle.id },
    })
    setPendingId(null)
    if (duplicateError) {
      setError(duplicateError.message)
      return
    }
    await habitsCollection.utils.refetch()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shared habits</CardTitle>
        <CardDescription>
          What each member is working on. Duplicate a habit to start tracking it
          yourself.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isLoading || members === undefined ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : members.length === 0 ? (
          <Empty className="gap-2 p-4">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="mb-1 size-8 [&_svg:not([class*='size-'])]:size-4"
              >
                <ListChecksIcon />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No shared habits yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                Share one of your habits from its detail page.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          members.map((member) => {
            const isMine = member.ownerUserId === user.id
            const doneCount = member.habits.filter(
              (habit) => habit.doneToday === 1,
            ).length
            return (
              <div key={member.ownerUserId} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {initialsFor(member.ownerName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {isMine ? "You" : member.ownerName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {doneCount} of {member.habits.length} done today
                  </span>
                </div>
                <ItemGroup>
                  {member.habits.map((habit) => {
                    const adopted = ownHabits.some(
                      (own) =>
                        own.sourceHabitId === habit.id &&
                        own.archivedAt === null,
                    )
                    return (
                      <Item key={habit.id} variant="outline" size="sm">
                        <ItemContent>
                          <div className="flex items-center gap-2">
                            <ItemTitle>{habit.name}</ItemTitle>
                            {habit.doneToday === 1 && (
                              <Badge variant="secondary">
                                <CircleCheckIcon />
                                Today
                              </Badge>
                            )}
                          </div>
                          <ItemDescription>
                            {formatHabitDays(habit.days)} · {habit.target}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Badge variant="outline">
                            <FlameIcon />
                            {habit.streak}
                          </Badge>
                          {!isMine &&
                            (adopted ? (
                              <Button variant="outline" size="sm" disabled>
                                Added
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={pendingId !== null}
                                onClick={() => duplicate(habit.id)}
                              >
                                <CopyIcon />
                                Duplicate
                              </Button>
                            ))}
                        </ItemActions>
                      </Item>
                    )
                  })}
                </ItemGroup>
              </div>
            )
          })
        )}
        <FieldError>{error}</FieldError>
      </CardContent>
    </Card>
  )
}
