import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"

import { listAchievementUnlocks } from "@/actions/achievements"
import { collectionsQueryClient, persistence } from "@/lib/db/browser"
import type { UserAchievementUnlockTable } from "@/lib/db/schema"

export type AchievementUnlockRecord = UserAchievementUnlockTable

export const achievementUnlocksCollection = createCollection(
  persistedCollectionOptions<AchievementUnlockRecord, string>({
    ...queryCollectionOptions({
      id: "achievement-unlocks",
      queryKey: ["achievement-unlocks"],
      queryClient: collectionsQueryClient,
      getKey: (unlock) => unlock.id,
      queryFn: () => listAchievementUnlocks(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)
