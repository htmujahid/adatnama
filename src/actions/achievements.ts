import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const listAchievementUnlocks = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    return db
      .selectFrom("user_achievement_unlock")
      .selectAll()
      .where("userId", "=", session.user.id)
      .orderBy("unlockedAt")
      .execute()
  },
)

export const unlockAchievement = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; achievementId: string; unlockedAt: string }) => data,
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, unlock: null }
    }

    const achievement = await db
      .selectFrom("achievement")
      .select("id")
      .where("id", "=", data.achievementId)
      .executeTakeFirst()
    if (!achievement) {
      return { error: { message: "Achievement not found." }, unlock: null }
    }

    await db
      .insertInto("user_achievement_unlock")
      .values({
        id: data.id,
        userId: session.user.id,
        achievementId: data.achievementId,
        unlockedAt: data.unlockedAt,
      })
      .onConflict((oc) => oc.columns(["userId", "achievementId"]).doNothing())
      .execute()

    const unlock = await db
      .selectFrom("user_achievement_unlock")
      .selectAll()
      .where("userId", "=", session.user.id)
      .where("achievementId", "=", data.achievementId)
      .executeTakeFirst()

    return { error: null, unlock: unlock ?? null }
  })
