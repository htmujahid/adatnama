import { useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import {
  shareHabitToCircle,
  unshareHabitFromCircle,
} from "@/actions/circle-habits"
import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { useCirclesCollection } from "@/lib/collection/circles"
import { useHabitsCollection } from "@/lib/collection/habits"
import { habitSharesQueryOptions } from "@/lib/query/circles"

export function HabitCirclesCard({ habitId }: { habitId: string }) {
  const queryClient = useQueryClient()
  const circlesCollection = useCirclesCollection()
  const habitsCollection = useHabitsCollection()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: habit } = useLiveQuery((q) =>
    q
      .from({ habits: habitsCollection })
      .where(({ habits }) => eq(habits.id, habitId))
      .findOne(),
  )
  const { data: circles = [] } = useLiveQuery((q) =>
    q.from({ circle: circlesCollection }),
  )
  const { data: sharedOrgIds = [], isLoading } = useQuery(
    habitSharesQueryOptions(habitId),
  )

  if (!habit || habit.archivedAt !== null) {
    return null
  }

  async function toggle(organizationId: string, next: boolean) {
    setPendingId(organizationId)
    setError(null)
    const action = next ? shareHabitToCircle : unshareHabitFromCircle
    const { error: toggleError } = await action({
      data: { habitId, organizationId },
    })
    setPendingId(null)
    if (toggleError) {
      setError(toggleError.message)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ["circles"] })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share to circles</CardTitle>
        <CardDescription>
          Members of a shared circle can see this habit and its streak, and
          duplicate it for themselves. Only you can check it in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {circles.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              You're not in any circles yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="/home/circles" />}
            >
              <UsersIcon />
              Circles
            </Button>
          </div>
        ) : (
          circles.map((circle) => (
            <Field key={circle.id} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={`share-${circle.id}`}>
                  <span className="flex items-center gap-2">
                    <CircleColorDot color={circle.color} className="size-3" />
                    {circle.name}
                  </span>
                </FieldLabel>
              </FieldContent>
              <Switch
                id={`share-${circle.id}`}
                checked={sharedOrgIds.includes(circle.id)}
                disabled={isLoading || pendingId !== null}
                onCheckedChange={(checked) => toggle(circle.id, checked)}
              />
            </Field>
          ))
        )}
        <FieldError>{error}</FieldError>
      </CardContent>
    </Card>
  )
}
