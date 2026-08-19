import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"

import { unlockAchievement } from "@/actions/achievements"
import type {
  AchievementUnlockRecord,
  AchievementUnlocksCollection,
} from "@/lib/collection/achievements"

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
