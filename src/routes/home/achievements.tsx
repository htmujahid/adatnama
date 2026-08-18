import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { differenceInCalendarDays, parseISO } from "date-fns"
import {
  AwardIcon,
  CircleCheckIcon,
  LockIcon,
  TargetIcon,
  TrophyIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAchievements } from "@/hooks/use-achievements"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/home/achievements")({
  component: AchievementsPage,
})

const FILTERS = ["all", "unlocked", "locked"] as const
type Filter = (typeof FILTERS)[number]

const FILTER_LABELS: Record<Filter, string> = {
  all: "All achievements",
  unlocked: "Unlocked",
  locked: "Locked",
}

function unlockedLabel(unlockedAt: string | null): string {
  if (!unlockedAt) return "Unlocked"
  const daysAgo = differenceInCalendarDays(new Date(), parseISO(unlockedAt))
  return daysAgo === 0 ? "Unlocked today" : `Unlocked ${daysAgo}d ago`
}

function AchievementsPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const { achievements, unlockedCount, isLoading } = useAchievements()

  const completionRate =
    achievements.length > 0
      ? Math.round((unlockedCount / achievements.length) * 100)
      : 0
  const nextUp = [...achievements]
    .filter((achievement) => !achievement.unlocked)
    .sort((a, b) => b.progress / b.target - a.progress / a.target)
    .at(0)

  const stats = [
    {
      label: "Unlocked",
      value: `${unlockedCount} of ${achievements.length}`,
      badge: "Earned",
      icon: TrophyIcon,
    },
    {
      label: "Completion",
      value: `${completionRate}%`,
      badge: "Overall",
      icon: TargetIcon,
    },
    {
      label: "Next up",
      value: nextUp?.name ?? "All done!",
      badge: nextUp
        ? `${Math.round((nextUp.progress / nextUp.target) * 100)}%`
        : "100%",
      icon: AwardIcon,
    },
  ] as const

  const filtered = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return true
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          Badges you've earned along the way.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {isLoading ? <Skeleton className="h-8 w-20" /> : stat.value}
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

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">All badges</h2>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as Filter)}
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {FILTERS.map((value) => (
              <SelectItem key={value} value={value}>
                {FILTER_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No achievements match this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((achievement) => (
            <Card key={achievement.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full",
                      achievement.unlocked
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {achievement.unlocked ? (
                      <achievement.icon className="size-5" />
                    ) : (
                      <LockIcon className="size-4" />
                    )}
                  </span>
                  <div>
                    <CardTitle>{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {achievement.unlocked ? (
                  <Badge variant="secondary">
                    <CircleCheckIcon />
                    {unlockedLabel(achievement.unlockedAt)}
                  </Badge>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Progress
                      value={(achievement.progress / achievement.target) * 100}
                    />
                    <span className="text-xs text-muted-foreground">
                      {achievement.progress} of {achievement.target}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
