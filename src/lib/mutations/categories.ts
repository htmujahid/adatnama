import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/actions/categories"
import type { CategoryRecord, categoriesCollection  } from "@/lib/collection/categories"

type CategoriesCollection = typeof categoriesCollection

export const categoryMutationFns: OfflineConfig["mutationFns"] = {
  "categories.create": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CategoriesCollection
    const result = await createCategory({
      data: mutation.modified as unknown as CategoryRecord,
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeInsert(result.category)
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
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeUpdate(result.category)
  },
  "categories.delete": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CategoriesCollection
    const result = await deleteCategory({
      data: { id: String(mutation.key) },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeDelete(String(mutation.key))
  },
}
