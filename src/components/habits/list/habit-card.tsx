import { Link } from "@tanstack/react-router"
import {
  BellIcon,
  CircleCheckIcon,
  FlameIcon,
  RepeatIcon,
  TargetIcon,
} from "lucide-react"

import { CategoryBadge } from "@/components/categories/category-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatHabitDays, utcTimeToLocal } from "@/lib/habits"
import type { HabitView } from "@/lib/habits"

export function HabitCard({ habit }: { habit: HabitView }) {
  return (
    <Card>
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
            {habit.reminderTime
              ? utcTimeToLocal(habit.reminderTime)
              : "No reminder"}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-1.5 text-sm">
            <FlameIcon className="size-4 text-primary" />
            <span className="font-semibold tabular-nums">{habit.streak}</span>
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
  )
}
