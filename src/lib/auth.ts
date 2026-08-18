import { betterAuth } from "better-auth"
import { organization, username } from "better-auth/plugins"
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
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  plugins: [
    username(),
    tanstackStartCookies(),
    organization({
      schema: {
        organization: {
          additionalFields: {
            description: { type: "string", required: true },
            color: { type: "string", required: true },
            joinCode: { type: "string", required: true, unique: true },
          },
        },
      },
    }),
  ],
})
