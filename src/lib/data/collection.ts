import { useEffect, useState } from "react"
import type { Collection } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { QueryClient } from "@tanstack/query-core"
import type { QueryCollectionConfig } from "@tanstack/query-db-collection"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"
import { useQueryClient } from "@tanstack/react-query"

import { getBrowserPersistence } from "@/lib/db/browser"

export type PersistedQueryCollectionConfig<
  T extends object,
  TKey extends string,
> = QueryCollectionConfig<T, any, any, any, TKey> & {
  id: string
  schemaVersion: number
}

const collections = new Map<string, Promise<Collection<any, any>>>()

export function getPersistedCollection<T extends object, TKey extends string>(
  config: PersistedQueryCollectionConfig<T, TKey>,
): Promise<Collection<T, TKey>> {
  if (typeof window === "undefined") {
    throw new Error("Persisted collections are only available in the browser.")
  }

  const cached = collections.get(config.id)
  if (cached) return cached as Promise<Collection<T, TKey>>

  const promise = getBrowserPersistence().then((persistence) =>
    createCollection(
      persistedCollectionOptions<T, TKey>({
        ...queryCollectionOptions(config),
        persistence,
        schemaVersion: config.schemaVersion,
      }),
    ),
  )
  collections.set(config.id, promise)
  return promise
}

export function useCollection<T extends object, TKey extends string>(
  getCollection: (queryClient: QueryClient) => Promise<Collection<T, TKey>>,
): Collection<T, TKey> | undefined {
  const queryClient = useQueryClient()
  const [collection, setCollection] = useState<Collection<T, TKey>>()

  useEffect(() => {
    let cancelled = false
    getCollection(queryClient).then((next) => {
      if (!cancelled) setCollection(next)
    })
    return () => {
      cancelled = true
    }
  }, [getCollection, queryClient])

  return collection
}

export async function disposePersistedCollection(id: string) {
  const pending = collections.get(id)
  collections.delete(id)
  const collection = await pending
  await collection?.cleanup()
}

export async function disposeAllPersistedCollections() {
  await Promise.all([...collections.keys()].map(disposePersistedCollection))
}
