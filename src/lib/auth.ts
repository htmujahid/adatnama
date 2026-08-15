import { betterAuth } from "better-auth"
import { admin, username } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { env } from "cloudflare:workers"

import { db } from "@/lib/db"

export const auth = betterAuth({
  database: { db, type: "sqlite" },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const { count } = await db
            .selectFrom("user")
            .select((eb) => eb.fn.countAll<number>().as("count"))
            .executeTakeFirstOrThrow()

          if (Number(count) === 0) {
            return { data: { ...user, role: "admin" } }
          }

          return { data: user }
        },
      },
    },
  },
  plugins: [username(), admin(), tanstackStartCookies()],
})
