import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { format } from "date-fns"
import {
  ArchiveIcon,
  BellIcon,
  CalendarDaysIcon,
  CircleCheckIcon,
  FlameIcon,
  ListChecksIcon,
  MedalIcon,
  PencilIcon,
  RepeatIcon,
  SnowflakeIcon,
  TargetIcon,
  TrophyIcon,
} from "lucide-react"

import { CategoryBadge } from "@/components/categories/category-badge"
import { HISTORY_LEGEND, HistoryGrid } from "@/components/habits/habit-history"
import { HabitNoteButton } from "@/components/habits/habit-note-button"
import {
  habitStatus,
  MILESTONES,
  STATUS_META,
} from "@/components/habits/habit-status"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useHabitCheckins } from "@/hooks/use-habit-checkins"
import { useHabit } from "@/hooks/use-habits"
import type { HabitView } from "@/hooks/use-habits"
import { useCollection } from "@/lib/data/collection"
import { getHabitsCollection } from "@/lib/data/habits"
import { useOfflineExecutor } from "@/lib/db/offline"
import { formatHabitDays, lastNDays, WEEK_LENGTH } from "@/lib/habits"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/home/habits/$habitId/")({
  component: HabitDetailPage,
})

function HabitDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-5 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1.5 h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

function HabitNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 py-24 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Habit not found
      </h1>
      <p className="text-sm text-muted-foreground">
        This habit doesn't exist or may have been removed.
      </p>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to="/home/habits" />}
      >
        <ListChecksIcon />
        All habits
      </Button>
    </div>
  )
}

function ArchiveHabitDialog({
  habit,
  open,
  onOpenChange,
}: {
  habit: HabitView
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const collection = useCollection(getHabitsCollection)
  const executor = useOfflineExecutor()
  const [note, setNote] = useState("")

  async function archive() {
    if (!collection || !executor) return
    const trimmed = note.trim()
    executor
      .createOfflineTransaction({ mutationFnName: "habits.archive" })
      .mutate(() => {
        collection.update(habit.id, (draft) => {
          draft.archivedAt = new Date().toISOString()
          draft.archivedNote = trimmed || null
        })
      })
    onOpenChange(false)
    await navigate({ to: "/home/habits/archived" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {habit.name}?</DialogTitle>
          <DialogDescription>
            Archived habits stop counting toward your streaks. You can restore
            them anytime.
          </DialogDescription>
        </DialogHeader>
        <Field className="mt-4">
          <FieldLabel htmlFor="archive-note">Note</FieldLabel>
          <Textarea
            id="archive-note"
            placeholder="Paused for winter — will revisit in spring."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
          />
          <FieldDescription>
            Optional — a reminder of why you're pausing this habit.
          </FieldDescription>
        </Field>
        <DialogFooter className="mt-6">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="button" onClick={archive}>
            <ArchiveIcon />
            Archive habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function HabitDetailPage() {
  const { habitId } = Route.useParams()
  const { habit, isLoading } = useHabit(habitId)
  const { todayByHabitId, toggleCheckin } = useHabitCheckins()
  const [archiveOpen, setArchiveOpen] = useState(false)

  if (isLoading && !habit) return <HabitDetailSkeleton />
  if (!habit) return <HabitNotFound />

  const note = todayByHabitId.get(habit.id)?.note ?? ""
  const done = habit.doneToday
  const status = habitStatus(habit)
  const statusMeta = STATUS_META[status]
  const weekDoneCount = habit.week.filter((day) => day === "done").length
  const weekDates = lastNDays(WEEK_LENGTH, new Date())

  const stats = [
    {
      label: "Current streak",
      value: `${habit.streak} days`,
      badge: statusMeta.label,
      icon: FlameIcon,
    },
    {
      label: "Best streak",
      value: `${habit.longestStreak} days`,
      badge: "All time",
      icon: TrophyIcon,
    },
    {
      label: "This week",
      value: `${weekDoneCount} of 7`,
      badge: "Check-ins",
      icon: CalendarDaysIcon,
    },
    {
      label: "Freezes left",
      value: `${habit.freezesLeft} of ${habit.freezesTotal}`,
      badge: "Available",
      icon: SnowflakeIcon,
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {habit.name}
            </h1>
            <Badge variant={statusMeta.badgeVariant}>
              <statusMeta.icon />
              {statusMeta.label}
            </Badge>
          </div>
          {habit.categoryId && (
            <div className="mt-1">
              <CategoryBadge categoryId={habit.categoryId} />
            </div>
          )}
          {note && (
            <p className="mt-1 text-sm text-muted-foreground italic">
              "{note}"
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setArchiveOpen(true)}
          >
            <ArchiveIcon />
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/home/habits/$habitId/edit"
                params={{ habitId: habit.id }}
              />
            }
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits" />}
          >
            <ListChecksIcon />
            All habits
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stat.value}
              </CardTitle>
              <CardAction>
                <Badge variant="secondary">
                  <stat.icon />
                  {stat.badge}
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
                        onClick={() => toggleCheckin(habit.id)}
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
                          state === "done" &&
                            "bg-primary text-primary-foreground",
                          state === "missed" &&
                            "bg-muted text-muted-foreground",
                          state === "frozen" &&
                            "bg-sky-400 text-white dark:bg-sky-500",
                        )}
                      >
                        {state === "done" && (
                          <CircleCheckIcon className="size-4" />
                        )}
                        {state === "frozen" && (
                          <SnowflakeIcon className="size-4" />
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Last 4 weeks</CardTitle>
                <CardDescription>Daily check-in history</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {HISTORY_LEGEND.map((item) => (
                  <span key={item.state} className="flex items-center gap-1.5">
                    <span
                      className={cn("size-2.5 rounded-sm", item.className)}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <HistoryGrid history={habit.history} />
          </CardContent>
        </Card>
      </div>

      <ArchiveHabitDialog
        habit={habit}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />
    </div>
  )
}
