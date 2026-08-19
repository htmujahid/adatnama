import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { env } from "cloudflare:workers"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { syncReminderSchedule } from "@/lib/reminders"

export type PushSubscriptionInput = {
  endpoint: string
  p256dh: string
  auth: string
}

export const getVapidPublicKey = createServerFn({ method: "GET" }).handler(
  async () => env.VAPID_PUBLIC_KEY,
)

export const savePushSubscription = createServerFn({ method: "POST" })
  .validator((data: PushSubscriptionInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await db
      .insertInto("push_subscription")
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        createdAt: new Date().toISOString(),
      })
      .onConflict((oc) =>
        oc.column("endpoint").doUpdateSet({
          userId: session.user.id,
          p256dh: data.p256dh,
          auth: data.auth,
        }),
      )
      .execute()

    await syncReminderSchedule(session.user.id)
    return { error: null }
  })

export const deletePushSubscription = createServerFn({ method: "POST" })
  .validator((data: { endpoint: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await db
      .deleteFrom("push_subscription")
      .where("endpoint", "=", data.endpoint)
      .where("userId", "=", session.user.id)
      .execute()

    await syncReminderSchedule(session.user.id)
    return { error: null }
  })
