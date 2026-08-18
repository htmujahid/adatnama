import type { OfflineConfig } from "@tanstack/offline-transactions"
import type { QueryClient } from "@tanstack/query-core"

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/actions/habit"
import { getPersistedCollection } from "@/lib/data/collection"
import type { CategoryTable } from "@/lib/db/schema"

export type CategoryRecord = CategoryTable

export type CategoryInput = {
  name: string
  color: string
}

export function getCategoriesCollection(queryClient: QueryClient) {
  return getPersistedCollection<CategoryRecord, string>({
    id: "categories",
    schemaVersion: 1,
    queryKey: ["categories"],
    queryClient,
    getKey: (category) => category.id,
    queryFn: () => listCategories(),
  })
}

type CategoriesCollection = Awaited<ReturnType<typeof getCategoriesCollection>>

export const categoryMutationFns: OfflineConfig["mutationFns"] = {
  "categories.create": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CategoriesCollection
    const result = await createCategory({
      data: mutation.modified as unknown as CategoryRecord,
    })
    if (result.category) collection.utils.writeInsert(result.category)
  },
  "categories.update": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CategoriesCollection
    const modified = mutation.modified as unknown as CategoryRecord
    const result = await updateCategory({
      data: {
        id: String(mutation.key),
        name: modified.name,
        color: modified.color,
      },
    })
    if (result.category) collection.utils.writeUpdate(result.category)
  },
  "categories.delete": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CategoriesCollection
    await deleteCategory({ data: { id: String(mutation.key) } })
    collection.utils.writeDelete(String(mutation.key))
  },
}
