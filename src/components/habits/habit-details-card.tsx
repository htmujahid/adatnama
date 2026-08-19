import { eq, useLiveQuery } from "@tanstack/react-db"
import {
  BellIcon,
  CalendarDaysIcon,
  RepeatIcon,
  TargetIcon,
} from "lucide-react"

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
import { foldHabitCheckinRows, formatHabitDays } from "@/lib/habits"

export function HabitDetailsCard({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const { data: rows = [], isLoading } = useLiveQuery((q) =>
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
  )
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)

  if (isLoading && !habit) {
    return <Skeleton className="h-48 w-full lg:col-span-2" />
  }

  if (!habit) {
    return null
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Details</CardTitle>
        <CardDescription>{habit.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TargetIcon className="size-3.5" />
              Target
            </dt>
            <dd className="mt-1 text-sm font-medium">{habit.target}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RepeatIcon className="size-3.5" />
              Frequency
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {formatHabitDays(habit.days)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BellIcon className="size-3.5" />
              Reminder
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {habit.reminderTime ?? "No reminder"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDaysIcon className="size-3.5" />
              Tracking since
            </dt>
            <dd className="mt-1 text-sm font-medium">
              {habit.startedDaysAgo === 0
                ? "Today"
                : `${habit.startedDaysAgo} days ago`}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}
