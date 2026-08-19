import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import type { QueryClient } from "@tanstack/react-query"

import { listCategories } from "@/actions/categories"
import { db } from "@/lib/db/browser"
import type { CategoryTable } from "@/lib/db/schema"

export type CategoryRecord = CategoryTable

export type CategoryInput = {
  name: string
  color: string
}

export const categoriesCollectionOptions = collectionOptions(
  "categories",
  (client) =>
    persistedCollectionOptions<CategoryRecord, string>({
      ...queryCollectionOptions({
        id: "categories",
        queryKey: ["categories"],
        queryClient: client.requireDependency<QueryClient>("queryClient"),
        getKey: (category) => category.id,
        queryFn: () => listCategories(),
      }),
      persistence:
        client.requireDependency<PersistedCollectionPersistence>("persistence"),
      schemaVersion: 1,
    }),
)

export const categoriesCollection = db.collection(categoriesCollectionOptions)
