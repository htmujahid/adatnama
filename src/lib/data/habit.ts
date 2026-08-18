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
    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          createCategory({ data: mutation.modified }),
        ),
      )
    },
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          updateCategory({
            data: {
              id: mutation.key,
              name: mutation.modified.name,
              color: mutation.modified.color,
            },
          }),
        ),
      )
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((mutation) =>
          deleteCategory({ data: { id: mutation.key } }),
        ),
      )
    },
  })
}
