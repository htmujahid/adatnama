import { useEffect, useState } from "react"
import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { startOfflineExecutor } from "@tanstack/offline-transactions"

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

async function createOfflineExecutor(): Promise<OfflineExecutor> {
  const executor = startOfflineExecutor({
    collections: {
      categories: categoriesCollection,
      circles: circlesCollection,
      habits: habitsCollection,
      checkins: checkinsCollection,
      achievementUnlocks: achievementUnlocksCollection,
      preferences: preferencesCollection,
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

export function getOfflineExecutor(): Promise<OfflineExecutor> {
  if (typeof window === "undefined") {
    throw new Error("Offline transactions are only available in the browser.")
  }
  if (!executorPromise) {
    executorPromise = createOfflineExecutor()
  }
  return executorPromise
}

export function useOfflineExecutor(): OfflineExecutor | undefined {
  const [executor, setExecutor] = useState<OfflineExecutor>()

  useEffect(() => {
    let cancelled = false
    getOfflineExecutor().then((next) => {
      if (!cancelled) setExecutor(next)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return executor
}
