import { useEffect, useMemo } from "react"
import { safeRandomUUID, useLiveQuery } from "@tanstack/react-db"
import { parseISO } from "date-fns"

import { useHabits } from "@/hooks/use-habits"
import { useHomeUser } from "@/hooks/use-home-user"
import {
  ACHIEVEMENT_DEFINITIONS,
  buildAchievementContext,
} from "@/lib/achievements"
import type { AchievementDefinition } from "@/lib/achievements"
import { getAchievementUnlocksCollection } from "@/lib/data/achievements"
import { getCirclesCollection } from "@/lib/data/circles"
import { useCollection } from "@/lib/data/collection"
import { useOfflineExecutor } from "@/lib/db/offline"
import { dateKey } from "@/lib/habits"

export type AchievementView = Omit<AchievementDefinition, "compute"> & {
  unlocked: boolean
  unlockedAt: string | null
  progress: number
  target: number
}

const attemptedUnlocks = new Set<string>()

export function useAchievements(): {
  achievements: Array<AchievementView>
  unlockedCount: number
  isLoading: boolean
} {
  const user = useHomeUser()
  const { habits, checkins, isLoading: habitsLoading } = useHabits()
  const circlesCollection = useCollection(getCirclesCollection)
  const unlocksCollection = useCollection(getAchievementUnlocksCollection)
  const executor = useOfflineExecutor()
  const { data: circles = [], isLoading: circlesLoading } = useLiveQuery(
    (q) => {
      if (!circlesCollection) return undefined
      return q.from({ circle: circlesCollection })
    },
  )
  const { data: unlocks = [], isLoading: unlocksLoading } = useLiveQuery(
    (q) => {
      if (!unlocksCollection) return undefined
      return q.from({ unlock: unlocksCollection })
    },
  )
  const isLoading =
    habitsLoading ||
    !circlesCollection ||
    circlesLoading ||
    !unlocksCollection ||
    unlocksLoading
  const todayKey = dateKey(new Date())

  const achievements = useMemo(() => {
    const doneCountByHabitId = new Map<string, number>()
    for (const checkin of checkins) {
      if (checkin.status !== "done") continue
      doneCountByHabitId.set(
        checkin.habitId,
        (doneCountByHabitId.get(checkin.habitId) ?? 0) + 1,
      )
    }
    const context = buildAchievementContext({
      habits,
      doneCountByHabitId,
      circleCount: circles.length,
      today: parseISO(todayKey),
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
  }, [habits, checkins, circles, unlocks, todayKey])

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
  }, [achievements, isLoading, unlocksCollection, executor, user.id])

  return {
    achievements,
    unlockedCount: achievements.filter((achievement) => achievement.unlocked)
      .length,
    isLoading,
  }
}
