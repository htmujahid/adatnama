import { useEffect, useState } from "react"
import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { startOfflineExecutor } from "@tanstack/offline-transactions"
import type { QueryClient } from "@tanstack/query-core"
import { useQueryClient } from "@tanstack/react-query"

import {
  achievementMutationFns,
  getAchievementUnlocksCollection,
} from "@/lib/data/achievements"
import {
  categoryMutationFns,
  getCategoriesCollection,
} from "@/lib/data/categories"
import { checkinMutationFns, getCheckinsCollection } from "@/lib/data/checkins"
import { circleMutationFns, getCirclesCollection } from "@/lib/data/circles"
import { getHabitsCollection, habitMutationFns } from "@/lib/data/habits"
import {
  getPreferencesCollection,
  preferencesMutationFns,
} from "@/lib/data/preferences"

let executorPromise: Promise<OfflineExecutor> | null = null

async function createOfflineExecutor(
  queryClient: QueryClient,
): Promise<OfflineExecutor> {
  const [
    categories,
    circles,
    habits,
    checkins,
    achievementUnlocks,
    preferences,
  ] = await Promise.all([
    getCategoriesCollection(queryClient),
    getCirclesCollection(queryClient),
    getHabitsCollection(queryClient),
    getCheckinsCollection(queryClient),
    getAchievementUnlocksCollection(queryClient),
    getPreferencesCollection(queryClient),
  ])

  const executor = startOfflineExecutor({
    collections: {
      categories,
      circles,
      habits,
      checkins,
      achievementUnlocks,
      preferences,
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

export function getOfflineExecutor(
  queryClient: QueryClient,
): Promise<OfflineExecutor> {
  if (typeof window === "undefined") {
    throw new Error("Offline transactions are only available in the browser.")
  }
  if (!executorPromise) {
    executorPromise = createOfflineExecutor(queryClient)
  }
  return executorPromise
}

export function useOfflineExecutor(): OfflineExecutor | undefined {
  const queryClient = useQueryClient()
  const [executor, setExecutor] = useState<OfflineExecutor>()

  useEffect(() => {
    let cancelled = false
    getOfflineExecutor(queryClient).then((next) => {
      if (!cancelled) setExecutor(next)
    })
    return () => {
      cancelled = true
    }
  }, [queryClient])

  return executor
}
