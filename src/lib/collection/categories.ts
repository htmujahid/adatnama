import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"

import { listCategories } from "@/actions/categories"
import { collectionsQueryClient, persistence } from "@/lib/db/browser"
import type { CategoryTable } from "@/lib/db/schema"

export type CategoryRecord = CategoryTable

export type CategoryInput = {
  name: string
  color: string
}

export const categoriesCollection = createCollection(
  persistedCollectionOptions<CategoryRecord, string>({
    ...queryCollectionOptions({
      id: "categories",
      queryKey: ["categories"],
      queryClient: collectionsQueryClient,
      getKey: (category) => category.id,
      queryFn: () => listCategories(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)
