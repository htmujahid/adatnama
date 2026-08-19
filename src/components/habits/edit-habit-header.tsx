import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useHabitsCollection } from "@/lib/collection/habits"

export function EditHabitHeader({ habitId }: { habitId: string }) {
  const habitsCollection = useHabitsCollection()
  const { data: habit, isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ habits: habitsCollection })
        .where(({ habits }) => eq(habits.id, habitId))
        .findOne(),
  })

  if (isLoading && !habit) {
    return <Skeleton className="h-8 w-56" />
  }

  if (!habit) {
    return null
  }

  return (
    <PageHeader
      title={<>Edit {habit.name}</>}
      description="Update the details for this habit."
    >
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={
          <Link to="/home/habits/$habitId" params={{ habitId: habit.id }} />
        }
      >
        <ListChecksIcon />
        Back to habit
      </Button>
    </PageHeader>
  )
}
