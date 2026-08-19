import type { OfflineExecutor } from "@tanstack/offline-transactions"

import type { PreferencesCollection } from "@/lib/collection/preferences"
import type { UserPreferencesTable } from "@/lib/db/schema"
import { HABIT_DAY_PRESETS } from "@/lib/habits"

export type HabitDefaults = {
  days: ReadonlyArray<number>
  freezesTotal: number
}

export const PREFERENCES_FALLBACK: Omit<UserPreferencesTable, "userId"> = {
  defaultSchedulePreset: HABIT_DAY_PRESETS[0].id,
  defaultFreezesTotal: 2,
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
    days: presetDays(
      record?.defaultSchedulePreset ??
        PREFERENCES_FALLBACK.defaultSchedulePreset,
    ),
    freezesTotal:
      record?.defaultFreezesTotal ?? PREFERENCES_FALLBACK.defaultFreezesTotal,
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
        ...PREFERENCES_FALLBACK,
        ...changes,
      })
    })
}
