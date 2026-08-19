import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"

import { upsertPreferences } from "@/actions/preferences"
import type { PreferencesCollection } from "@/lib/collection/preferences"
import type { UserPreferencesTable } from "@/lib/db/schema"

async function upsertFromMutation(mutation: {
  collection: unknown
  modified: unknown
}) {
  const collection = mutation.collection as PreferencesCollection
  const modified = mutation.modified as UserPreferencesTable
  const result = await upsertPreferences({
    data: {
      defaultSchedulePreset: modified.defaultSchedulePreset,
      defaultFreezesTotal: modified.defaultFreezesTotal,
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
