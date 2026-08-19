import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { CategoryTable } from "@/lib/db/schema"

export type CategoryInput = {
  name: string
  color: string
}

export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<CategoryTable>> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    return db
      .selectFrom("category")
      .selectAll()
      .where("userId", "=", session.user.id)
      .orderBy("name")
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
    const category = await db
      .insertInto("category")
      .values({
        id: data.id,
        userId: session.user.id,
        name: data.name,
        color: data.color,
        createdAt: now,
        updatedAt: now,
      })
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          name: data.name,
          color: data.color,
        }),
      )
      .returningAll()
      .executeTakeFirstOrThrow()

    return { error: null, category }
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

    return { error: null, category: updated }
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
