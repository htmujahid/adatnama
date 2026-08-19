import { useEffect, useMemo, useState } from "react"
import { eq, safeRandomUUID, useLiveQuery } from "@tanstack/react-db"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { CircleCheckIcon, LockIcon, TrophyIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import {
  ACHIEVEMENT_DEFINITIONS,
  buildAchievementContext,
} from "@/lib/achievements"
import { useAchievementUnlocksCollection } from "@/lib/collection/achievements"
import { checkinsCollection } from "@/lib/collection/checkins"
import { circlesCollection } from "@/lib/collection/circles"
import { habitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"
import { dateKey, foldHabitCheckinRows } from "@/lib/habits"
import { cn } from "@/lib/utils"

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

const attemptedUnlocks = new Set<string>()

export function AchievementsList() {
  const [filter, setFilter] = useState<Filter>("all")
  const user = useHomeUser()
  const executor = useOfflineExecutor()
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

  useEffect(() => {
    if (isLoading || !executor) return
    for (const achievement of achievements) {
      if (
        !achievement.unlocked ||
        achievement.unlockedAt !== null ||
        attemptedUnlocks.has(achievement.id)
      ) {
        continue
      }
      attemptedUnlocks.add(achievement.id)
      executor
        .createOfflineTransaction({ mutationFnName: "achievements.unlock" })
        .mutate(() => {
          unlocksCollection.insert({
            id: safeRandomUUID(),
            userId: user.id,
            achievementId: achievement.id,
            unlockedAt: new Date().toISOString(),
          })
        })
    }
  }, [achievements, isLoading, executor, user.id, unlocksCollection])

  const filtered = achievements.filter((achievement) => {
    if (filter === "unlocked") return achievement.unlocked
    if (filter === "locked") return !achievement.unlocked
    return true
  })

  return (
    <>
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
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrophyIcon />
            </EmptyMedia>
            <EmptyTitle>No achievements found</EmptyTitle>
            <EmptyDescription>
              No achievements match this filter.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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
    </>
  )
}
