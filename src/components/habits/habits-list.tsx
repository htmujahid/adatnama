import { useState } from "react"
import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { ListChecksIcon, PlusIcon, SearchIcon } from "lucide-react"

import { HabitCard } from "@/components/habits/habit-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { categoriesCollection } from "@/lib/collection/categories"
import { checkinsCollection } from "@/lib/collection/checkins"
import { habitsCollection } from "@/lib/collection/habits"
import { foldHabitCheckinRows } from "@/lib/habits"

export function HabitsList() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const today = new Date()
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
        .where(({ habit }) => isNull(habit.archivedAt)),
  })
  const habits = foldHabitCheckinRows(rows, today)
  const { data: categories = [] } = useLiveQuery({
    query: (q) => q.from({ category: categoriesCollection }),
  })
  const filtered = habits.filter((habit) => {
    const matchesSearch = habit.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    const matchesCategory = category === null || habit.categoryId === category
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search habits..."
            className="pl-8"
            aria-label="Search habits"
          />
        </div>
        <Select
          value={category ?? "all"}
          onValueChange={(value) => setCategory(value === "all" ? null : value)}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1.5 h-5 w-20 rounded-full" />
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : habits.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecksIcon />
            </EmptyMedia>
            <EmptyTitle>No habits yet</EmptyTitle>
            <EmptyDescription>
              Create your first habit to start building streaks.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link to="/home/habits/new" />}
            >
              <PlusIcon />
              New habit
            </Button>
          </EmptyContent>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchIcon />
            </EmptyMedia>
            <EmptyTitle>No matching habits</EmptyTitle>
            <EmptyDescription>No habits match "{search}".</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
    </>
  )
}
