import { betterAuth } from "better-auth"
import { username } from "better-auth/plugins"
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
  plugins: [username(), tanstackStartCookies()],
})
