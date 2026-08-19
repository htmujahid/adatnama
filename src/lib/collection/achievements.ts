import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { listAchievementUnlocks } from "@/actions/achievements"
import { persistence } from "@/lib/db/browser"
import type { UserAchievementUnlockTable } from "@/lib/db/schema"

export type AchievementUnlockRecord = UserAchievementUnlockTable

export const achievementUnlocksCollection = collectionOptions(
  "achievement-unlocks",
  (client) =>
    persistedCollectionOptions<AchievementUnlockRecord, string>({
      ...queryCollectionOptions({
        id: "achievement-unlocks",
        queryKey: ["achievement-unlocks"],
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        getKey: (unlock) => unlock.id,
        queryFn: () => listAchievementUnlocks(),
      }),
      persistence,
      schemaVersion: 1,
    }),
)

export function useAchievementUnlocksCollection() {
  return useDbClient().collection(achievementUnlocksCollection)
}

export type AchievementUnlocksCollection = ReturnType<
  typeof useAchievementUnlocksCollection
>
