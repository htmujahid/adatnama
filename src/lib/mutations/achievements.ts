import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"

import { unlockAchievement } from "@/actions/achievements"
import type { AchievementUnlocksCollection } from "@/lib/collection/achievements"
import type { UserAchievementUnlockTable } from "@/lib/db/schema"

export const achievementMutationFns: OfflineConfig["mutationFns"] = {
  "achievements.unlock": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection =
      mutation.collection as unknown as AchievementUnlocksCollection
    const modified = mutation.modified as unknown as UserAchievementUnlockTable
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
