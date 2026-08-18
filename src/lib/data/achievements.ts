import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"
import type { QueryClient } from "@tanstack/query-core"

import {
  listAchievementUnlocks,
  unlockAchievement,
} from "@/actions/achievements"
import { getPersistedCollection } from "@/lib/data/collection"
import type { UserAchievementUnlockTable } from "@/lib/db/schema"

export type AchievementUnlockRecord = UserAchievementUnlockTable

export function getAchievementUnlocksCollection(queryClient: QueryClient) {
  return getPersistedCollection<AchievementUnlockRecord, string>({
    id: "achievement-unlocks",
    schemaVersion: 1,
    queryKey: ["achievement-unlocks"],
    queryClient,
    getKey: (unlock) => unlock.id,
    queryFn: () => listAchievementUnlocks(),
  })
}

type AchievementUnlocksCollection = Awaited<
  ReturnType<typeof getAchievementUnlocksCollection>
>

export const achievementMutationFns: OfflineConfig["mutationFns"] = {
  "achievements.unlock": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection =
      mutation.collection as unknown as AchievementUnlocksCollection
    const modified = mutation.modified as unknown as AchievementUnlockRecord
    const result = await unlockAchievement({
      data: {
        id: modified.id,
        achievementId: modified.achievementId,
        unlockedAt: modified.unlockedAt,
      },
    })
    if (result.error || !result.unlock) {
      throw new NonRetriableError(result.error?.message ?? "Unlock failed.")
    }
    collection.utils.writeUpsert(result.unlock)
  },
}
