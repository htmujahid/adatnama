import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import type { Filter } from "@/components/reui/filters"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { FilterFieldMap } from "@/lib/db-filters"
import { buildFiltersExpression, resolveSortColumn } from "@/lib/db-filters"
import type { Database, UserTable } from "@/lib/db/schema"

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    return auth.api.getSession({ headers })
  },
)

export const getUserCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const row = await db
      .selectFrom("user")
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },
)

export type ListUsersInput = {
  page: number
  pageSize: number
  sortBy: string
  sortDirection: "asc" | "desc"
  filters: Filter[]
}

const USER_SORT_COLUMNS: Record<string, keyof UserTable> = {
  name: "name",
  email: "email",
  role: "role",
  status: "banned",
  createdAt: "createdAt",
}

const USER_FILTER_FIELDS: FilterFieldMap<Database, "user"> = {
  name: { type: "text", column: "name" },
  email: { type: "text", column: "email" },
  role: { type: "select", column: "role" },
  status: {
    type: "select",
    column: "banned",
    toColumnValue: (value) => (value === "banned" ? 1 : 0),
  },
}

export const listUsers = createServerFn({ method: "GET" })
  .validator((input: ListUsersInput) => input)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (session?.user.role !== "admin") {
      throw new Error("Forbidden")
    }

    const sortColumn = resolveSortColumn(
      USER_SORT_COLUMNS,
      data.sortBy,
      "createdAt",
    )
    const sortDirection = data.sortDirection === "asc" ? "asc" : "desc"
    const pageSize = data.pageSize > 0 ? data.pageSize : 10
    const page = data.page >= 0 ? data.page : 0

    let query = db.selectFrom("user")

    if (data.filters.length > 0) {
      query = query.where((eb) =>
        buildFiltersExpression(eb, data.filters, USER_FILTER_FIELDS),
      )
    }

    const [users, totalRow] = await Promise.all([
      query
        .selectAll()
        .orderBy(sortColumn, sortDirection)
        .limit(pageSize)
        .offset(page * pageSize)
        .execute(),
      query
        .select((eb) => eb.fn.countAll<number>().as("count"))
        .executeTakeFirstOrThrow(),
    ])

    return { users, total: Number(totalRow.count) }
  })

export const getUserById = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })

    if (session?.user.role !== "admin") {
      throw new Error("Forbidden")
    }

    const user = await db
      .selectFrom("user")
      .selectAll()
      .where("id", "=", userId)
      .executeTakeFirst()

    if (!user) {
      throw new Error("User not found")
    }

    return user
  })
