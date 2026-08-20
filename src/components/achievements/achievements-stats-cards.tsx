import { useMemo } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { parseISO } from "date-fns"
import { AwardIcon, TargetIcon, TrophyIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ACHIEVEMENT_DEFINITIONS,
  buildAchievementContext,
} from "@/lib/achievements"
import { useAchievementUnlocksCollection } from "@/lib/collection/achievements"
import { checkinsCollection } from "@/lib/collection/checkins"
import { circlesCollection } from "@/lib/collection/circles"
import { habitsCollection } from "@/lib/collection/habits"
import { dateKey, foldHabitCheckinRows } from "@/lib/habits"

export function AchievementsStatsCards() {
  const unlocksCollection = useAchievementUnlocksCollection()
  const todayKey = dateKey(new Date())

  const { data: habitCheckinRows = [], isLoading: habitsLoading } =
    useLiveQuery({
      query: (q) =>
        q.from({ habit: habitsCollection }).leftJoin(
          {
            checkin: q
              .from({ checkin: checkinsCollection })
              .where(({ checkin }) => eq(checkin.status, "done")),
          },
          ({ habit, checkin }) => eq(checkin.habitId, habit.id),
        ),
    })
  const { data: circles = [], isLoading: circlesLoading } = useLiveQuery({
    query: (q) => q.from({ circle: circlesCollection }),
  })
  const { data: unlocks = [], isLoading: unlocksLoading } = useLiveQuery({
    query: (q) => q.from({ unlock: unlocksCollection }),
  })
  const isLoading = habitsLoading || circlesLoading || unlocksLoading

  const achievements = useMemo(() => {
    const today = parseISO(todayKey)
    const habits = foldHabitCheckinRows(habitCheckinRows, today)
    const doneCountByHabitId = new Map<string, number>()
    for (const { habit, checkin } of habitCheckinRows) {
      if (!checkin) continue
      doneCountByHabitId.set(
        habit.id,
        (doneCountByHabitId.get(habit.id) ?? 0) + 1,
      )
    }
    const context = buildAchievementContext({
      habits,
      doneCountByHabitId,
      circleCount: circles.length,
      today,
    })
    return ACHIEVEMENT_DEFINITIONS.map(({ compute, ...definition }) => {
      const { progress, target, achieved } = compute(context)
      const unlock = unlocks.find(
        (candidate) => candidate.achievementId === definition.id,
      )
      return {
        ...definition,
        progress,
        target,
        unlocked: unlock !== undefined || achieved,
        unlockedAt: unlock?.unlockedAt ?? null,
      }
    })
  }, [habitCheckinRows, circles, unlocks, todayKey])

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  )
}
