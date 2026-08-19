import type { OfflineExecutor } from "@tanstack/offline-transactions"

import type { PreferencesCollection } from "@/lib/collection/preferences"
import type { UserPreferencesTable } from "@/lib/db/schema"
import { HABIT_DAY_PRESETS } from "@/lib/habits"

export type HabitDefaults = {
  category: string | null
  days: ReadonlyArray<number>
  freezesTotal: number
}

export type NotificationPreferences = {
  reminders: boolean
  weeklySummary: boolean
  circleActivity: boolean
}

export const PREFERENCES_FALLBACK: Omit<
  UserPreferencesTable,
  "userId" | "timezone"
> = {
  defaultCategoryId: null,
  defaultSchedulePreset: HABIT_DAY_PRESETS[0].id,
  defaultFreezesTotal: 2,
  remindersEnabled: 1,
  weeklySummaryEnabled: 1,
  circleActivityEnabled: 0,
}

export function presetDays(presetId: string): ReadonlyArray<number> {
  const preset = HABIT_DAY_PRESETS.find(
    (candidate) => candidate.id === presetId,
  )
  return preset?.days ?? HABIT_DAY_PRESETS[0].days
}

export function habitDefaultsFrom(
  record: UserPreferencesTable | undefined,
): HabitDefaults {
  return {
    category:
      record?.defaultCategoryId ?? PREFERENCES_FALLBACK.defaultCategoryId,
    days: presetDays(
      record?.defaultSchedulePreset ??
        PREFERENCES_FALLBACK.defaultSchedulePreset,
    ),
    freezesTotal:
      record?.defaultFreezesTotal ?? PREFERENCES_FALLBACK.defaultFreezesTotal,
  }
}

export function notificationsFrom(
  record: UserPreferencesTable | undefined,
): NotificationPreferences {
  return {
    reminders:
      (record?.remindersEnabled ?? PREFERENCES_FALLBACK.remindersEnabled) === 1,
    weeklySummary:
      (record?.weeklySummaryEnabled ??
        PREFERENCES_FALLBACK.weeklySummaryEnabled) === 1,
    circleActivity:
      (record?.circleActivityEnabled ??
        PREFERENCES_FALLBACK.circleActivityEnabled) === 1,
  }
}

export function savePreferences({
  executor,
  collection,
  userId,
  record,
  changes,
}: {
  executor: OfflineExecutor | undefined
  collection: PreferencesCollection
  userId: string
  record: UserPreferencesTable | undefined
  changes: Partial<Omit<UserPreferencesTable, "userId">>
}) {
  if (!executor) return
  if (record) {
    executor
      .createOfflineTransaction({ mutationFnName: "preferences.update" })
      .mutate(() => {
        collection.update(userId, (draft) => {
          Object.assign(draft, changes)
        })
      })
    return
  }
  executor
    .createOfflineTransaction({ mutationFnName: "preferences.create" })
    .mutate(() => {
      collection.insert({
        userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...PREFERENCES_FALLBACK,
        ...changes,
      })
    })
}
