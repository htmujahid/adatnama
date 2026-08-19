import { useState } from "react"
import { and, eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { ArchiveIcon, ListChecksIcon, PencilIcon } from "lucide-react"

import { CategoryBadge } from "@/components/categories/category-badge"
import { ArchiveHabitDialog } from "@/components/habits/archive-habit-dialog"
import { HabitNotFound } from "@/components/habits/habit-not-found"
import { habitStatus, STATUS_META } from "@/components/habits/habit-status"
import { PageHeader } from "@/components/layouts/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"
import { useHabitsCollection } from "@/lib/collection/habits"
import { dateKey, foldHabitCheckinRows } from "@/lib/habits"

export function HabitDetailHeader({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const todayKey = dateKey(new Date())
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
  const { data: todayCheckins = [] } = useLiveQuery((q) =>
    q
      .from({ checkin: checkinsCollection })
      .where(({ checkin }) =>
        and(eq(checkin.habitId, habitId), eq(checkin.date, todayKey)),
      ),
  )
  const [archiveOpen, setArchiveOpen] = useState(false)
  const habit = foldHabitCheckinRows(rows, new Date()).at(0)
  const todayCheckin = todayCheckins.at(0)

  if (isLoading && !habit) {
    return (
      <div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-5 w-24 rounded-full" />
      </div>
    )
  }

  if (!habit) {
    return <HabitNotFound />
  }

  const note = todayCheckin?.note ?? ""
  const statusMeta = STATUS_META[habitStatus(habit)]

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {habit.name}
            <Badge variant={statusMeta.badgeVariant}>
              <statusMeta.icon />
              {statusMeta.label}
            </Badge>
          </span>
        }
        description={
          <>
            {habit.categoryId && (
              <div className="mt-1">
                <CategoryBadge categoryId={habit.categoryId} />
              </div>
            )}
            {note && <p className="mt-1 italic">"{note}"</p>}
          </>
        }
      >
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
      </PageHeader>

      <ArchiveHabitDialog
        habit={habit}
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
      />
    </>
  )
}
