import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import type { QueryClient } from "@tanstack/react-query"

import { listAchievementUnlocks } from "@/actions/achievements"
import { db } from "@/lib/db/browser"
import type { UserAchievementUnlockTable } from "@/lib/db/schema"

export type AchievementUnlockRecord = UserAchievementUnlockTable

export const achievementUnlocksCollectionOptions = collectionOptions(
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
      persistence:
        client.requireDependency<PersistedCollectionPersistence>("persistence"),
      schemaVersion: 1,
    }),
)

export const achievementUnlocksCollection = db.collection(
  achievementUnlocksCollectionOptions,
)
