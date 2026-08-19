import { eq, useLiveQuery } from "@tanstack/react-db"
import { MedalIcon } from "lucide-react"

import { MILESTONES } from "@/components/habits/habit-status"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"
import { cn } from "@/lib/utils"

export function HabitMilestonesCard({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const { data: rows = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habit: habitsCollection })
        .leftJoin(
          {
            checkin: q
              .from({ checkin: checkinsCollection })
              .where(({ checkin }) => eq(checkin.status, "done")),
          },
          ({ habit, checkin }) => eq(checkin.habitId, habit.id),
        )
        .where(({ habit }) => eq(habit.id, habitId)),
  })
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)

  if (isLoading && !habit) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!habit) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <CardDescription>Based on your best streak</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {MILESTONES.map((days) => {
            const achieved = habit.longestStreak >= days
            return (
              <Badge
                key={days}
                variant={achieved ? "secondary" : "outline"}
                className={cn(!achieved && "text-muted-foreground/60")}
              >
                <MedalIcon />
                {days} days
              </Badge>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
