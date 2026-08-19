import { useEffect, useState } from "react"
import { startOfflineExecutor } from "@tanstack/offline-transactions"
import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { useDbClient } from "@tanstack/react-db"
import type { DbClient } from "@tanstack/react-db"

import { achievementUnlocksCollection } from "@/lib/collection/achievements"
import { categoriesCollection } from "@/lib/collection/categories"
import { checkinsCollection } from "@/lib/collection/checkins"
import { circlesCollection } from "@/lib/collection/circles"
import { habitsCollection } from "@/lib/collection/habits"
import { preferencesCollection } from "@/lib/collection/preferences"
import { achievementMutationFns } from "@/lib/mutations/achievements"
import { categoryMutationFns } from "@/lib/mutations/categories"
import { checkinMutationFns } from "@/lib/mutations/checkins"
import { circleMutationFns } from "@/lib/mutations/circles"
import { habitMutationFns } from "@/lib/mutations/habits"
import { preferencesMutationFns } from "@/lib/mutations/preferences"

let executorPromise: Promise<OfflineExecutor> | null = null

async function createOfflineExecutor(
  client: DbClient,
): Promise<OfflineExecutor> {
  const executor = startOfflineExecutor({
    collections: {
      categories: client.collection(categoriesCollection),
      circles: client.collection(circlesCollection),
      habits: client.collection(habitsCollection),
      checkins: client.collection(checkinsCollection),
      achievementUnlocks: client.collection(achievementUnlocksCollection),
      preferences: client.collection(preferencesCollection),
    },
    mutationFns: {
      ...categoryMutationFns,
      ...circleMutationFns,
      ...habitMutationFns,
      ...checkinMutationFns,
      ...achievementMutationFns,
      ...preferencesMutationFns,
    },
  })
  await executor.waitForInit()
  return executor
}

export function getOfflineExecutor(client: DbClient): Promise<OfflineExecutor> {
  if (typeof window === "undefined") {
    throw new Error("Offline transactions are only available in the browser.")
  }
  if (!executorPromise) {
    executorPromise = createOfflineExecutor(client)
  }
  return executorPromise
}

export function useOfflineExecutor(): OfflineExecutor | undefined {
  const client = useDbClient()
  const [executor, setExecutor] = useState<OfflineExecutor>()

  useEffect(() => {
    let cancelled = false
    getOfflineExecutor(client).then((next) => {
      if (!cancelled) setExecutor(next)
    })
    return () => {
      cancelled = true
    }
  }, [client])

  return executor
}
