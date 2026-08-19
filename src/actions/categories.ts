import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { CategoryTable } from "@/lib/db/schema"

export type CategoryInput = {
  name: string
  color: string
}

export type CategoryWithHabitsCount = CategoryTable & { habitsCount: number }

function selectCategoriesWithHabitsCount(userId: string) {
  return db
    .selectFrom("category")
    .leftJoin("habit", "habit.categoryId", "category.id")
    .selectAll("category")
    .select((eb) => eb.fn.count<number>("habit.id").as("habitsCount"))
    .where("category.userId", "=", userId)
    .groupBy("category.id")
}

export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<CategoryWithHabitsCount>> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    return selectCategoriesWithHabitsCount(session.user.id)
      .orderBy("category.name")
      .execute()
  },
)

export const createCategory = createServerFn({ method: "POST" })
  .validator((data: { id: string } & CategoryInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, category: null }
    }

    const now = new Date().toISOString()
    const category: CategoryTable = {
      id: data.id,
      userId: session.user.id,
      name: data.name,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    }
    await db
      .insertInto("category")
      .values(category)
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          name: category.name,
          color: category.color,
        }),
      )
      .execute()

    const result = await selectCategoriesWithHabitsCount(session.user.id)
      .where("category.id", "=", data.id)
      .executeTakeFirstOrThrow()

    return { error: null, category: result }
  })

export const updateCategory = createServerFn({ method: "POST" })
  .validator((data: { id: string } & CategoryInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, category: null }
    }

    const updated = await db
      .updateTable("category")
      .set({
        name: data.name,
        color: data.color,
        updatedAt: new Date().toISOString(),
      })
      .where("id", "=", data.id)
      .where("userId", "=", session.user.id)
      .returningAll()
      .executeTakeFirst()

    if (!updated) {
      return { error: { message: "Category not found." }, category: null }
    }

    const result = await selectCategoriesWithHabitsCount(session.user.id)
      .where("category.id", "=", data.id)
      .executeTakeFirstOrThrow()

    return { error: null, category: result }
  })

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await db
      .deleteFrom("category")
      .where("id", "=", data.id)
      .where("userId", "=", session.user.id)
      .execute()

    return { error: null }
  })
