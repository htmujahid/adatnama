import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type CheckinStatus = "done" | "pending"

export type CheckinInput = {
  id: string
  habitId: string
  date: string
  status: CheckinStatus
  note: string | null
}

export const listCheckins = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    return db
      .selectFrom("habit_checkin")
      .innerJoin("habit", "habit.id", "habit_checkin.habitId")
      .selectAll("habit_checkin")
      .where("habit.userId", "=", session.user.id)
      .orderBy("habit_checkin.date")
      .execute()
  },
)

export const upsertCheckin = createServerFn({ method: "POST" })
  .validator((data: CheckinInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, checkin: null }
    }

    const habit = await db
      .selectFrom("habit")
      .select("id")
      .where("id", "=", data.habitId)
      .where("userId", "=", session.user.id)
      .executeTakeFirst()
    if (!habit) {
      return { error: { message: "Habit not found." }, checkin: null }
    }

    const now = new Date().toISOString()
    await db
      .insertInto("habit_checkin")
      .values({
        id: data.id,
        habitId: data.habitId,
        date: data.date,
        status: data.status,
        note: data.note,
        createdAt: now,
        updatedAt: now,
      })
      .onConflict((oc) =>
        oc.columns(["habitId", "date"]).doUpdateSet({
          status: data.status,
          note: data.note,
          updatedAt: now,
        }),
      )
      .execute()

    const checkin = await db
      .selectFrom("habit_checkin")
      .selectAll()
      .where("habitId", "=", data.habitId)
      .where("date", "=", data.date)
      .executeTakeFirst()

    return { error: null, checkin: checkin ?? null }
  })

export const deleteCheckin = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await db
      .deleteFrom("habit_checkin")
      .where("id", "=", data.id)
      .where("habitId", "in", (qb) =>
        qb
          .selectFrom("habit")
          .select("id")
          .where("userId", "=", session.user.id),
      )
      .execute()

    return { error: null }
  })
