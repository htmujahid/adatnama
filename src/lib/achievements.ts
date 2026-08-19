import {
  FlagIcon,
  FlameIcon,
  GemIcon,
  SparklesIcon,
  SunriseIcon,
  TargetIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"

import { ACHIEVEMENT_IDS } from "@/lib/achievement-ids"
import type { AchievementId } from "@/lib/achievement-ids"
import { isScheduledOn, lastNDays, reminderMinutes } from "@/lib/habits"
import type { HabitDayState } from "@/lib/habits"

export type AchievementContext = {
  totalDone: number
  bestStreak: number
  weeklyDone: number
  weeklyScheduled: number
  circleCount: number
  hasEarlyCheckin: boolean
}

export type AchievementProgress = {
  progress: number
  target: number
  achieved: boolean
}

export type AchievementDefinition = {
  id: AchievementId
  name: string
  description: string
  icon: typeof FlagIcon
  compute: (context: AchievementContext) => AchievementProgress
}

function thresholdProgress(value: number, target: number): AchievementProgress {
  return {
    progress: Math.min(value, target),
    target,
    achieved: value >= target,
  }
}

const DEFINITION_BY_ID: Record<
  AchievementId,
  Omit<AchievementDefinition, "id">
> = {
  "first-step": {
    name: "First step",
    description: "Complete your first check-in",
    icon: FlagIcon,
    compute: (context) => thresholdProgress(context.totalDone, 1),
  },
  "week-warrior": {
    name: "Week warrior",
    description: "Hit a 7-day streak",
    icon: FlameIcon,
    compute: (context) => thresholdProgress(context.bestStreak, 7),
  },
  consistent: {
    name: "Consistent",
    description: "Score 80%+ completion in a week",
    icon: TargetIcon,
    compute: (context) => {
      const rate =
        context.weeklyScheduled > 0
          ? Math.round((context.weeklyDone / context.weeklyScheduled) * 100)
          : 0
      return thresholdProgress(rate, 80)
    },
  },
  "team-player": {
    name: "Team player",
    description: "Join a circle",
    icon: UsersIcon,
    compute: (context) => thresholdProgress(context.circleCount, 1),
  },
  "early-riser": {
    name: "Early riser",
    description: "Complete a habit with a reminder before 7 AM",
    icon: SunriseIcon,
    compute: (context) => thresholdProgress(context.hasEarlyCheckin ? 1 : 0, 1),
  },
  "month-master": {
    name: "Month master",
    description: "Hit a 30-day streak",
    icon: TrophyIcon,
    compute: (context) => thresholdProgress(context.bestStreak, 30),
  },
  "century-club": {
    name: "Century club",
    description: "Hit a 100-day streak",
    icon: GemIcon,
    compute: (context) => thresholdProgress(context.bestStreak, 100),
  },
  "perfect-week": {
    name: "Perfect week",
    description: "Every habit, every day for a week",
    icon: SparklesIcon,
    compute: (context) => ({
      progress: context.weeklyDone,
      target: Math.max(context.weeklyScheduled, 1),
      achieved:
        context.weeklyScheduled > 0 &&
        context.weeklyDone >= context.weeklyScheduled,
    }),
  },
}

export const ACHIEVEMENT_DEFINITIONS: ReadonlyArray<AchievementDefinition> =
  ACHIEVEMENT_IDS.map((id) => ({ id, ...DEFINITION_BY_ID[id] }))

type HabitForContext = {
  days: ReadonlyArray<number>
  freezesTotal: number
  startedAt: string
  reminderTime: string | null
  archivedAt: string | null
  longestStreak: number
  week: ReadonlyArray<HabitDayState>
}

const EARLY_RISER_CUTOFF = 7 * 60

export function buildAchievementContext({
  habits,
  doneCountByHabitId,
  circleCount,
  today,
}: {
  habits: ReadonlyArray<HabitForContext & { id: string }>
  doneCountByHabitId: ReadonlyMap<string, number>
  circleCount: number
  today: Date
}): AchievementContext {
  const active = habits.filter((habit) => !habit.archivedAt)
  const weekDays = lastNDays(7, today)

  let totalDone = 0
  let bestStreak = 0
  let weeklyDone = 0
  let weeklyScheduled = 0
  let hasEarlyCheckin = false

  for (const habit of habits) {
    totalDone += doneCountByHabitId.get(habit.id) ?? 0
    bestStreak = Math.max(bestStreak, habit.longestStreak)
  }
  for (const habit of active) {
    weeklyDone += habit.week.filter((state) => state === "done").length
    weeklyScheduled += weekDays.filter((day) =>
      isScheduledOn(habit, day),
    ).length
    if (
      habit.reminderTime !== null &&
      reminderMinutes(habit.reminderTime) < EARLY_RISER_CUTOFF &&
      (doneCountByHabitId.get(habit.id) ?? 0) > 0
    ) {
      hasEarlyCheckin = true
    }
  }
  return {
    totalDone,
    bestStreak,
    weeklyDone,
    weeklyScheduled,
    circleCount,
    hasEarlyCheckin,
  }
}
