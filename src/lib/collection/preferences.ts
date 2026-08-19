import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import type { QueryClient } from "@tanstack/react-query"

import { listPreferences } from "@/actions/preferences"
import { db } from "@/lib/db/browser"
import type { UserPreferencesTable } from "@/lib/db/schema"

export type PreferencesRecord = UserPreferencesTable

export const preferencesCollectionOptions = collectionOptions(
  "preferences",
  (client) =>
    persistedCollectionOptions<PreferencesRecord, string>({
      ...queryCollectionOptions({
        id: "preferences",
        queryKey: ["preferences"],
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        getKey: (preferences) => preferences.userId,
        queryFn: () => listPreferences(),
      }),
      persistence:
        client.requireDependency<PersistedCollectionPersistence>("persistence"),
      schemaVersion: 1,
    }),
)

export const preferencesCollection = db.collection(preferencesCollectionOptions)
