import { useLiveQuery } from "@tanstack/react-db"

import { useHomeUser } from "@/hooks/use-home-user"
import { preferencesCollection } from "@/lib/collection/preferences"
import type { PreferencesRecord } from "@/lib/collection/preferences"
import { useOfflineExecutor } from "@/lib/db/offline"
import { HABIT_DAY_PRESETS, schedulePresetFor } from "@/lib/habits"

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

const FALLBACK: Omit<PreferencesRecord, "userId" | "timezone"> = {
  defaultCategoryId: null,
  defaultSchedulePreset: HABIT_DAY_PRESETS[0].id,
  defaultFreezesTotal: 2,
  remindersEnabled: 1,
  weeklySummaryEnabled: 1,
  circleActivityEnabled: 0,
}

function presetDays(presetId: string): ReadonlyArray<number> {
  const preset = HABIT_DAY_PRESETS.find(
    (candidate) => candidate.id === presetId,
  )
  return preset?.days ?? HABIT_DAY_PRESETS[0].days
}

export function usePreferences() {
  const user = useHomeUser()
  const executor = useOfflineExecutor()
  const { data: rows = [], isLoading } = useLiveQuery((q) =>
    q.from({ preferences: preferencesCollection }),
  )
  const record = rows.find((row) => row.userId === user.id)

  const habitDefaults: HabitDefaults = {
    category: record?.defaultCategoryId ?? FALLBACK.defaultCategoryId,
    days: presetDays(
      record?.defaultSchedulePreset ?? FALLBACK.defaultSchedulePreset,
    ),
    freezesTotal: record?.defaultFreezesTotal ?? FALLBACK.defaultFreezesTotal,
  }
  const notifications: NotificationPreferences = {
    reminders: (record?.remindersEnabled ?? FALLBACK.remindersEnabled) === 1,
    weeklySummary:
      (record?.weeklySummaryEnabled ?? FALLBACK.weeklySummaryEnabled) === 1,
    circleActivity:
      (record?.circleActivityEnabled ?? FALLBACK.circleActivityEnabled) === 1,
  }

  function save(changes: Partial<Omit<PreferencesRecord, "userId">>) {
    if (!executor) return
    if (record) {
      executor
        .createOfflineTransaction({ mutationFnName: "preferences.update" })
        .mutate(() => {
          preferencesCollection.update(user.id, (draft) => {
            Object.assign(draft, changes)
          })
        })
      return
    }
    executor
      .createOfflineTransaction({ mutationFnName: "preferences.create" })
      .mutate(() => {
        preferencesCollection.insert({
          userId: user.id,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...FALLBACK,
          ...changes,
        })
      })
  }

  function updateHabitDefaults(input: HabitDefaults) {
    save({
      defaultCategoryId: input.category,
      defaultSchedulePreset:
        schedulePresetFor(input.days) ?? HABIT_DAY_PRESETS[0].id,
      defaultFreezesTotal: input.freezesTotal,
    })
  }

  function setNotificationPreference(
    key: keyof NotificationPreferences,
    value: boolean,
  ) {
    const field = {
      reminders: "remindersEnabled",
      weeklySummary: "weeklySummaryEnabled",
      circleActivity: "circleActivityEnabled",
    } as const
    save({ [field[key]]: value ? 1 : 0 })
  }

  return {
    habitDefaults,
    notifications,
    isLoading,
    updateHabitDefaults,
    setNotificationPreference,
  }
}
