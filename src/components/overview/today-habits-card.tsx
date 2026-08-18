import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { FlameIcon, ListChecksIcon, PlusIcon } from "lucide-react"

import { HabitNoteButton } from "@/components/habits/habit-note-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { useHabitCheckins } from "@/hooks/use-habit-checkins"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import {
  computeHabitStats,
  dateKey,
  doneDatesByHabitId,
  isScheduledOn,
} from "@/lib/habits"
import type { HabitDayState, HabitStats } from "@/lib/habits"
import { cn } from "@/lib/utils"

const EMPTY_DONE_DATES: ReadonlySet<string> = new Set()

type TodayHabit = HabitStats & {
  id: string
  name: string
}

function WeekDots({ week }: { week: ReadonlyArray<HabitDayState> }) {
  return (
    <div className="flex items-center gap-1.5">
      {week.map((day, index) => (
        <span
          key={index}
          className={cn(
            "size-1.5 rounded-full",
            day === "done" && "bg-primary",
            day === "missed" && "bg-muted",
            day === "frozen" && "bg-sky-400 dark:bg-sky-500",
            day === "today" && "bg-muted ring-2 ring-primary/30",
          )}
        />
      ))}
    </div>
  )
}

function TodayHabitItem({ habit }: { habit: TodayHabit }) {
  const { todayByHabitId, toggleCheckin } = useHabitCheckins()
  const note = todayByHabitId.get(habit.id)?.note ?? ""
  const done = habit.doneToday

  return (
    <Item
      variant="outline"
      onClick={() => toggleCheckin(habit.id)}
      className="cursor-pointer select-none transition-colors hover:bg-muted/60 active:bg-muted"
    >
      <ItemMedia>
        <Checkbox
          checked={done}
          onCheckedChange={() => toggleCheckin(habit.id)}
          onClick={(event) => {
            event.stopPropagation()
          }}
          aria-label={`Mark ${habit.name} as ${done ? "not done" : "done"} for today`}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{habit.name}</ItemTitle>
        <ItemDescription>
          {habit.freezesLeft > 0
            ? `${habit.freezesLeft} freeze${habit.freezesLeft > 1 ? "s" : ""} left`
            : "No freezes left"}
        </ItemDescription>
        {note && <ItemDescription className="italic">"{note}"</ItemDescription>}
      </ItemContent>
      <ItemActions>
        <WeekDots week={habit.week} />
        <HabitNoteButton habitId={habit.id} habitName={habit.name} />
        <Badge variant={done ? "secondary" : "outline"}>
          <FlameIcon />
          {habit.streak}
        </Badge>
      </ItemActions>
    </Item>
  )
}

export function TodayHabitsCard() {
  const today = new Date()
  const todayKey = dateKey(today)

  const { data: activeHabits = [], isLoading: habitsLoading } = useLiveQuery(
    (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => isNull(habit.archivedAt)),
  )
  const { data: todayHabitRecords = [] } = useLiveQuery(
    (q) =>
      q
        .from({ habit: habitsCollection })
        .where(({ habit }) => isNull(habit.archivedAt))
        .fn.where(({ habit }) => isScheduledOn(habit, today)),
    [todayKey],
  )
  const { data: doneCheckins = [], isLoading: checkinsLoading } = useLiveQuery(
    (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) => eq(checkin.status, "done")),
  )
  const isLoading = habitsLoading || checkinsLoading

  const doneDates = doneDatesByHabitId(doneCheckins)
  const todayHabits: Array<TodayHabit> = todayHabitRecords.map((habit) => ({
    id: habit.id,
    name: habit.name,
    ...computeHabitStats(
      habit,
      doneDates.get(habit.id) ?? EMPTY_DONE_DATES,
      today,
    ),
  }))
  const doneToday = todayHabits.filter((habit) => habit.doneToday).length

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Today's habits</CardTitle>
        <CardDescription>
          {doneToday} of {todayHabits.length} habits checked in
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        ) : todayHabits.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ListChecksIcon className="size-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              {activeHabits.length > 0
                ? "No habits are scheduled for today."
                : "You aren't tracking any habits yet."}
            </p>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link to="/home/habits/new" />}
            >
              <PlusIcon />
              New habit
            </Button>
          </div>
        ) : (
          <ItemGroup>
            {todayHabits.map((habit) => (
              <TodayHabitItem key={habit.id} habit={habit} />
            ))}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  )
}
