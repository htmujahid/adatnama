import { useLiveQuery } from "@tanstack/react-db"
import { differenceInCalendarDays, format } from "date-fns"
import { CalendarCheckIcon, CircleCheckIcon } from "lucide-react"

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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import { dateKey, lastNDays } from "@/lib/habits"

export function CheckinsWeekActivityCard() {
  const { data: habits = [], isLoading: habitsLoading } = useLiveQuery((q) =>
    q.from({ habit: habitsCollection }),
  )
  const { data: checkins = [], isLoading: checkinsLoading } = useLiveQuery(
    (q) => q.from({ checkin: checkinsCollection }),
  )
  const isLoading = habitsLoading || checkinsLoading

  const today = new Date()
  const weekDateKeys = lastNDays(7, today).map(dateKey)
  const habitNameById = new Map(habits.map((habit) => [habit.id, habit.name]))
  const weekActivity = checkins
    .filter(
      (checkin) =>
        checkin.status === "done" && weekDateKeys.includes(checkin.date),
    )
    .map((checkin) => {
      const daysAgo = differenceInCalendarDays(
        today,
        new Date(`${checkin.date}T00:00:00`),
      )
      const label =
        daysAgo === 0
          ? "Today"
          : daysAgo === 1
            ? "Yesterday"
            : format(new Date(`${checkin.date}T00:00:00`), "MMM d")
      return {
        id: checkin.id,
        habit: habitNameById.get(checkin.habitId) ?? "Habit",
        daysAgo,
        label,
      }
    })
    .sort((a, b) => a.daysAgo - b.daysAgo || a.habit.localeCompare(b.habit))

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week's activity</CardTitle>
        <CardDescription>Every check-in, last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : weekActivity.length === 0 ? (
          <Empty className="gap-2 p-4">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="mb-1 size-8 [&_svg:not([class*='size-'])]:size-4"
              >
                <CalendarCheckIcon />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No check-ins yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                No check-ins in the last 7 days yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <ItemGroup>
              {weekActivity.map((event) => (
                <Item key={event.id} variant="outline" size="sm">
                  <ItemMedia>
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CircleCheckIcon className="size-3.5" />
                    </span>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{event.habit}</ItemTitle>
                    <ItemDescription>{event.label}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
