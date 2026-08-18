import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"

import { listPreferences } from "@/actions/preferences"
import { collectionsQueryClient, persistence } from "@/lib/db/browser"
import type { UserPreferencesTable } from "@/lib/db/schema"

export type PreferencesRecord = UserPreferencesTable

export const preferencesCollection = createCollection(
  persistedCollectionOptions<PreferencesRecord, string>({
    ...queryCollectionOptions({
      id: "preferences",
      queryKey: ["preferences"],
      queryClient: collectionsQueryClient,
      getKey: (preferences) => preferences.userId,
      queryFn: () => listPreferences(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)
