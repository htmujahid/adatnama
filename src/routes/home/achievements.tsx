import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
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
import { cn } from "@/lib/utils"

import { ACHIEVEMENTS } from "./-data"

export const Route = createFileRoute("/home/achievements")({
  component: AchievementsPage,
})

const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length
const completionRate = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)

const nextUp = [...ACHIEVEMENTS]
  .filter((a) => !a.unlocked)
  .sort((a, b) => b.progress / b.target - a.progress / a.target)[0]

const STATS = [
  {
    label: "Unlocked",
    value: `${unlockedCount} of ${ACHIEVEMENTS.length}`,
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
    value: nextUp.name,
    badge: `${Math.round((nextUp.progress / nextUp.target) * 100)}%`,
    icon: AwardIcon,
  },
] as const

const FILTERS = ["all", "unlocked", "locked"] as const
type Filter = (typeof FILTERS)[number]

const FILTER_LABELS: Record<Filter, string> = {
  all: "All achievements",
  unlocked: "Unlocked",
  locked: "Locked",
}

function AchievementsPage() {
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = ACHIEVEMENTS.filter((achievement) => {
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
        {STATS.map((stat) => (
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

      {filtered.length === 0 ? (
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
                    Unlocked {achievement.unlockedDaysAgo}d ago
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
