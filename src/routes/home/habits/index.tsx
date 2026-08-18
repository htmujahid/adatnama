import { useState } from "react"
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
  TagIcon,
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"
import { useHabitCatalog } from "@/hooks/use-habit-catalog"

export const Route = createFileRoute("/home/habits/")({
  component: HabitsPage,
})

function HabitsPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const HABIT_LIST = useHabitCatalog()
  const categories = useCategories()

  const CATEGORIES = Array.from(
    new Set(HABIT_LIST.map((habit) => habit.category)),
  ).map((id) => ({
    id,
    label: categories.find((c) => c.id === id)?.name ?? id,
  }))

  const dailyCount = HABIT_LIST.filter(
    (habit) => habit.frequency === "Daily",
  ).length
  const reminderCount = HABIT_LIST.filter(
    (habit) => habit.reminderTime !== null,
  ).length

  const HABIT_STATS = [
    {
      label: "Total habits",
      value: `${HABIT_LIST.length}`,
      badge: "All active",
      icon: ListChecksIcon,
    },
    {
      label: "Daily habits",
      value: `${dailyCount} of ${HABIT_LIST.length}`,
      badge: "Every day",
      icon: RepeatIcon,
    },
    {
      label: "Reminders set",
      value: `${reminderCount} of ${HABIT_LIST.length}`,
      badge: "Enabled",
      icon: BellIcon,
    },
  ] as const

  const filtered = HABIT_LIST.filter((habit) => {
    const matchesSearch = habit.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())
    const matchesCategory = category === null || habit.category === category
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
            render={<Link to="/home/categories" />}
          >
            <TagIcon />
            Categories
          </Button>
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
        {HABIT_STATS.map((stat) => (
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
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No habits match "{search}".
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((habit) => (
            <Card key={habit.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1.5">
                    <CardTitle>{habit.name}</CardTitle>
                    <CategoryBadge categoryId={habit.category} />
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
                    {habit.frequency}
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
