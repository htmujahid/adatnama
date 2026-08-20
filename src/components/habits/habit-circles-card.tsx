import { useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

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
import {
  circlesCollection,
  habitSharesCollection,
  useHabitSharesCollection,
} from "@/lib/collection/circles"
import { habitsCollection } from "@/lib/collection/habits"

export function HabitCirclesCard({ habitId }: { habitId: string }) {
  const shares = useHabitSharesCollection(habitId)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { data: habit } = useLiveQuery({
    query: (q) =>
      q
        .from({ habits: habitsCollection })
        .where(({ habits }) => eq(habits.id, habitId))
        .findOne(),
  })
  const { data: circles = [] } = useLiveQuery({
    query: (q) => q.from({ circle: circlesCollection }),
  })
  const { data: sharedOrgIds = [], isLoading } = useLiveQuery({
    query: (q) => q.from({ share: habitSharesCollection(habitId) }),
  })

  if (!habit || habit.archivedAt !== null) {
    return null
  }

  async function toggle(organizationId: string, next: boolean) {
    setPendingId(organizationId)
    setError(null)
    try {
      const tx = next
        ? shares.insert({ id: organizationId })
        : shares.delete(organizationId)
      await tx.isPersisted.promise
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to update sharing.",
      )
    } finally {
      setPendingId(null)
    }
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
                checked={sharedOrgIds.some((share) => share.id === circle.id)}
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
