import { useState } from "react"
import { eq, isNull, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArchiveIcon,
  BellIcon,
  CircleCheckIcon,
  FlameIcon,
  ListChecksIcon,
  PlusIcon,
  RepeatIcon,
  SearchIcon,
  TargetIcon,
} from "lucide-react"

import { CategoryBadge } from "@/components/categories/category-badge"
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
import { foldHabitCheckinRows, formatHabitDays } from "@/lib/habits"

export const Route = createFileRoute("/home/habits/")({
  component: HabitsPage,
})

function HabitsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const today = new Date()
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
      .where(({ habit }) => isNull(habit.archivedAt)),
  )
  const habits = foldHabitCheckinRows(rows, today)
  const { data: categories = [] } = useLiveQuery((q) =>
    q.from({ category: categoriesCollection }),
  )

  const usedCategories = Array.from(
    new Set(
      habits
        .map((habit) => habit.categoryId)
        .filter((id): id is string => id !== null),
    ),
  ).map((id) => ({
    id,
    label: categories.find((candidate) => candidate.id === id)?.name ?? id,
  }))

  const dailyCount = habits.filter((habit) => habit.days.length === 7).length
  const reminderCount = habits.filter(
    (habit) => habit.reminderTime !== null,
  ).length

  const stats = [
    {
      label: "Total habits",
      value: `${habits.length}`,
      badge: "All active",
      icon: ListChecksIcon,
    },
    {
      label: "Daily habits",
      value: `${dailyCount} of ${habits.length}`,
      badge: "Every day",
      icon: RepeatIcon,
    },
    {
      label: "Reminders set",
      value: `${reminderCount} of ${habits.length}`,
      badge: "Enabled",
      icon: BellIcon,
    },
  ] as const

  const filtered = habits.filter((habit) => {
    const matchesSearch = habit.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    const matchesCategory = category === null || habit.categoryId === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Habits
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything you're tracking, in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits/archived" />}
          >
            <ArchiveIcon />
            Archived
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link to="/home/habits/new" />}
          >
            <PlusIcon />
            New habit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
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
            {usedCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
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
            <Card key={habit.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5">
                    <CardTitle>{habit.name}</CardTitle>
                    {habit.categoryId && (
                      <CategoryBadge categoryId={habit.categoryId} />
                    )}
                  </div>
                  <Badge variant="secondary">
                    <CircleCheckIcon />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="line-clamp-1 text-sm text-muted-foreground">
                  {habit.description}
                </p>

                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <TargetIcon className="size-3.5" />
                    {habit.target}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <RepeatIcon className="size-3.5" />
                    {formatHabitDays(habit.days)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BellIcon className="size-3.5" />
                    {habit.reminderTime ?? "No reminder"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="flex items-center gap-1.5 text-sm">
                    <FlameIcon className="size-4 text-primary" />
                    <span className="font-semibold tabular-nums">
                      {habit.streak}
                    </span>
                    <span className="text-muted-foreground">day streak</span>
                  </span>
                  <Link
                    to="/home/habits/$habitId"
                    params={{ habitId: habit.id }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View detail
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
