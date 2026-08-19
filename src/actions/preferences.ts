import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { syncReminderSchedule } from "@/lib/reminders"

export type PreferencesInput = {
  defaultSchedulePreset: string
  defaultFreezesTotal: number
}

export const listPreferences = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    return db
      .selectFrom("user_preferences")
      .selectAll()
      .where("userId", "=", session.user.id)
      .execute()
  },
)

export const upsertPreferences = createServerFn({ method: "POST" })
  .validator((data: PreferencesInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, preferences: null }
    }

    const preferences = {
      userId: session.user.id,
      defaultSchedulePreset: data.defaultSchedulePreset,
      defaultFreezesTotal: data.defaultFreezesTotal,
    }
    await db
      .insertInto("user_preferences")
      .values(preferences)
      .onConflict((oc) =>
        oc.column("userId").doUpdateSet({
          defaultSchedulePreset: preferences.defaultSchedulePreset,
          defaultFreezesTotal: preferences.defaultFreezesTotal,
        }),
      )
      .execute()

    await syncReminderSchedule(session.user.id)
    return { error: null, preferences }
  })
