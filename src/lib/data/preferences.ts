import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"
import type { QueryClient } from "@tanstack/query-core"

import { listPreferences, upsertPreferences } from "@/actions/preferences"
import { getPersistedCollection } from "@/lib/data/collection"
import type { UserPreferencesTable } from "@/lib/db/schema"

export type PreferencesRecord = UserPreferencesTable

export function getPreferencesCollection(queryClient: QueryClient) {
  return getPersistedCollection<PreferencesRecord, string>({
    id: "preferences",
    schemaVersion: 1,
    queryKey: ["preferences"],
    queryClient,
    getKey: (preferences) => preferences.userId,
    queryFn: () => listPreferences(),
  })
}

type PreferencesCollection = Awaited<
  ReturnType<typeof getPreferencesCollection>
>

async function upsertFromMutation(mutation: {
  collection: unknown
  modified: unknown
}) {
  const collection = mutation.collection as PreferencesCollection
  const modified = mutation.modified as PreferencesRecord
  const result = await upsertPreferences({
    data: {
      timezone: modified.timezone,
      defaultCategoryId: modified.defaultCategoryId,
      defaultSchedulePreset: modified.defaultSchedulePreset,
      defaultFreezesTotal: modified.defaultFreezesTotal,
      remindersEnabled: modified.remindersEnabled,
      weeklySummaryEnabled: modified.weeklySummaryEnabled,
      circleActivityEnabled: modified.circleActivityEnabled,
    },
  })
  if (result.error) {
    throw new NonRetriableError(result.error.message)
  }
  collection.utils.writeUpsert(result.preferences)
}

export const preferencesMutationFns: OfflineConfig["mutationFns"] = {
  "preferences.create": async ({ transaction }) => {
    await upsertFromMutation(transaction.mutations[0])
  },
  "preferences.update": async ({ transaction }) => {
    await upsertFromMutation(transaction.mutations[0])
  },
}
