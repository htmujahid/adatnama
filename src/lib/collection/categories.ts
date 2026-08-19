import { collectionOptions } from "@tanstack/db"
import { persistedCollectionOptions } from "@tanstack/db-sqlite-persistence-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { listCategories } from "@/actions/categories"
import { persistence } from "@/lib/db/browser"
import type { CategoryTable } from "@/lib/db/schema"

export type CategoryRecord = CategoryTable & { habitsCount: number }

export type CategoryInput = {
  name: string
  color: string
}

export const categoriesCollection = collectionOptions("categories", (client) =>
  persistedCollectionOptions<CategoryRecord, string>({
    ...queryCollectionOptions({
      id: "categories",
      queryKey: ["categories"],
      queryClient: client.requireDependency<QueryClient>("queryClient"),
      getKey: (category) => category.id,
      queryFn: () => listCategories(),
    }),
    persistence,
    schemaVersion: 1,
  }),
)

export function useCategoriesCollection() {
  return useDbClient().collection(categoriesCollection)
}

export type CategoriesCollection = ReturnType<typeof useCategoriesCollection>
