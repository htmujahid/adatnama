import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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
