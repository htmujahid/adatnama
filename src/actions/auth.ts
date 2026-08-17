import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { APIError } from "better-auth/api"

import { auth } from "@/lib/auth"

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    return auth.api.getSession({ headers })
  },
)

export const listAccounts = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    return auth.api.listUserAccounts({ headers })
  },
)

export const setPassword = createServerFn({ method: "POST" })
  .validator((data: { newPassword: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()

    try {
      await auth.api.setPassword({
        body: { newPassword: data.newPassword },
        headers,
      })
      return { error: null }
    } catch (error) {
      if (error instanceof APIError) {
        return { error: { message: error.message } }
      }
      throw error
    }
  })
