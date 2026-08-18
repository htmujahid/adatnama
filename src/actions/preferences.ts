import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type PreferencesInput = {
  timezone: string
  defaultCategoryId: string | null
  defaultSchedulePreset: string
  defaultFreezesTotal: number
  remindersEnabled: number
  weeklySummaryEnabled: number
  circleActivityEnabled: number
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
      timezone: data.timezone,
      defaultCategoryId: data.defaultCategoryId,
      defaultSchedulePreset: data.defaultSchedulePreset,
      defaultFreezesTotal: data.defaultFreezesTotal,
      remindersEnabled: data.remindersEnabled,
      weeklySummaryEnabled: data.weeklySummaryEnabled,
      circleActivityEnabled: data.circleActivityEnabled,
    }
    await db
      .insertInto("user_preferences")
      .values(preferences)
      .onConflict((oc) =>
        oc.column("userId").doUpdateSet({
          timezone: preferences.timezone,
          defaultCategoryId: preferences.defaultCategoryId,
          defaultSchedulePreset: preferences.defaultSchedulePreset,
          defaultFreezesTotal: preferences.defaultFreezesTotal,
          remindersEnabled: preferences.remindersEnabled,
          weeklySummaryEnabled: preferences.weeklySummaryEnabled,
          circleActivityEnabled: preferences.circleActivityEnabled,
        }),
      )
      .execute()

    return { error: null, preferences }
  })
