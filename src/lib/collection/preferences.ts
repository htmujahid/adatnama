import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { listPreferences } from "@/actions/preferences"
import { persistence } from "@/lib/db/browser"
import type { UserPreferencesTable } from "@/lib/db/schema"

export const preferencesCollection = collectionOptions(
  "preferences",
  (client) =>
    persistedCollectionOptions<UserPreferencesTable, string>({
      ...queryCollectionOptions({
        id: "preferences",
        queryKey: ["preferences"],
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        getKey: (preferences) => preferences.userId,
        queryFn: () => listPreferences(),
      }),
      persistence,
      schemaVersion: 1,
    }),
)

export function usePreferencesCollection() {
  return useDbClient().collection(preferencesCollection)
}

export type PreferencesCollection = ReturnType<typeof usePreferencesCollection>
