import { and, eq, useLiveQuery } from "@tanstack/react-db"
import { format } from "date-fns"
import { CircleCheckIcon, SnowflakeIcon } from "lucide-react"

import { HabitNoteButton } from "@/components/habits/habit-note-button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toggleCheckin } from "@/lib/checkins"
import {
  checkinsCollection,
  useCheckinsCollection,
} from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"
import {
  dateKey,
  foldHabitCheckinRows,
  lastNDays,
  WEEK_LENGTH,
} from "@/lib/habits"
import { cn } from "@/lib/utils"

export function HabitWeekCard({ habitId }: { habitId: string }) {
  const executor = useOfflineExecutor()
  const habitsCollection = useHabitsCollection()
  const collection = useCheckinsCollection()
  const todayKey = dateKey(new Date())
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
  const { data: todayCheckins = [] } = useLiveQuery({
    query: (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) =>
          and(eq(checkin.habitId, habitId), eq(checkin.date, todayKey)),
        ),
  })
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)
  const todayCheckin = todayCheckins.at(0)

  if (isLoading && !habit) {
    return <Skeleton className="h-48 w-full" />
  }

  if (!habit) {
    return null
  }

  const toggle = () =>
    toggleCheckin({ executor, collection, todayKey }, habit.id, todayCheckin)
  const done = habit.doneToday
  const weekDates = lastNDays(WEEK_LENGTH, new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>Day by day</CardDescription>
        <CardAction>
          <HabitNoteButton habitId={habit.id} habitName={habit.name} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-2">
          {habit.week.map((state, index) => {
            const isToday = index === habit.week.length - 1
            return (
              <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {format(weekDates[index], "MMM d")}
                </span>
                {isToday ? (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-pressed={done}
                    aria-label={
                      done ? "Mark today as not done" : "Mark today as done"
                    }
                    className={cn(
                      "flex size-10 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95",
                      done
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        : "bg-muted text-muted-foreground ring-2 ring-primary/40 hover:bg-muted/70",
                    )}
                  >
                    {done && <CircleCheckIcon className="size-5" />}
                  </button>
                ) : (
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full",
                      state === "done" && "bg-primary text-primary-foreground",
                      state === "missed" && "bg-muted text-muted-foreground",
                      state === "frozen" &&
                        "bg-sky-400 text-white dark:bg-sky-500",
                    )}
                  >
                    {state === "done" && <CircleCheckIcon className="size-4" />}
                    {state === "frozen" && <SnowflakeIcon className="size-4" />}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
