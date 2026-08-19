import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { sql } from "kysely"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { syncReminderSchedule } from "@/lib/reminders"

export type CircleSharedHabitRow = {
  id: string
  userId: string
  name: string
  description: string
  target: string
  reminderTime: string | null
  freezesTotal: number
  startedAt: string
  ownerName: string
  sharedAt: string
  memberSince: string
}

export type CircleHabitsPayload = {
  habits: Array<CircleSharedHabitRow>
  days: Array<{ habitId: string; dayOfWeek: number }>
  checkins: Array<{ habitId: string; date: string }>
}

export const listCircleHabits = createServerFn({ method: "GET" })
  .validator((data: { organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, payload: null }
    }

    const membership = await db
      .selectFrom("member")
      .select("id")
      .where("organizationId", "=", data.organizationId)
      .where("userId", "=", session.user.id)
      .executeTakeFirst()
    if (!membership) {
      return {
        error: { message: "You are not a member of this circle." },
        payload: null,
      }
    }

    const habits = await db
      .selectFrom("circle_habit")
      .innerJoin("habit", "habit.id", "circle_habit.habitId")
      .innerJoin("user", "user.id", "habit.userId")
      .innerJoin("member as owner", (join) =>
        join
          .onRef("owner.organizationId", "=", "circle_habit.organizationId")
          .onRef("owner.userId", "=", "habit.userId"),
      )
      .select([
        "habit.id",
        "habit.userId",
        "habit.name",
        "habit.description",
        "habit.target",
        "habit.reminderTime",
        "habit.freezesTotal",
        "habit.startedAt",
        "user.name as ownerName",
        "circle_habit.createdAt as sharedAt",
        "owner.createdAt as memberSince",
      ])
      .where("circle_habit.organizationId", "=", data.organizationId)
      .where("habit.archivedAt", "is", null)
      .execute()

    if (habits.length === 0) {
      const payload: CircleHabitsPayload = { habits, days: [], checkins: [] }
      return { error: null, payload }
    }

    const habitIds = habits.map((habit) => habit.id)
    const [days, checkins] = await Promise.all([
      db
        .selectFrom("habit_schedule_day")
        .select(["habitId", "dayOfWeek"])
        .where("habitId", "in", habitIds)
        .execute(),
      db
        .selectFrom("habit_checkin")
        .select(["habitId", "date"])
        .where("habitId", "in", habitIds)
        .where("status", "=", "done")
        .execute(),
    ])

    const payload: CircleHabitsPayload = { habits, days, checkins }
    return { error: null, payload }
  })

export const listHabitShares = createServerFn({ method: "GET" })
  .validator((data: { habitId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    const rows = await db
      .selectFrom("circle_habit")
      .innerJoin("habit", "habit.id", "circle_habit.habitId")
      .select("circle_habit.organizationId")
      .where("circle_habit.habitId", "=", data.habitId)
      .where("habit.userId", "=", session.user.id)
      .execute()
    return rows.map((row) => row.organizationId)
  })

export const shareHabitToCircle = createServerFn({ method: "POST" })
  .validator((data: { habitId: string; organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await sql`
      INSERT INTO "circle_habit" ("id", "organizationId", "habitId", "createdAt")
      SELECT ${crypto.randomUUID()}, ${data.organizationId}, ${data.habitId}, ${new Date().toISOString()}
      WHERE EXISTS (SELECT 1 FROM "habit" WHERE "id" = ${data.habitId} AND "userId" = ${session.user.id} AND "archivedAt" IS NULL)
        AND EXISTS (SELECT 1 FROM "member" WHERE "organizationId" = ${data.organizationId} AND "userId" = ${session.user.id})
      ON CONFLICT ("organizationId", "habitId") DO NOTHING
    `.execute(db)

    const row = await db
      .selectFrom("circle_habit")
      .select("id")
      .where("organizationId", "=", data.organizationId)
      .where("habitId", "=", data.habitId)
      .executeTakeFirst()
    if (!row) {
      return { error: { message: "Habit or circle not found." } }
    }
    return { error: null }
  })

export const unshareHabitFromCircle = createServerFn({ method: "POST" })
  .validator((data: { habitId: string; organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await db
      .deleteFrom("circle_habit")
      .where("organizationId", "=", data.organizationId)
      .where("habitId", "=", data.habitId)
      .where("habitId", "in", (qb) =>
        qb
          .selectFrom("habit")
          .select("id")
          .where("userId", "=", session.user.id),
      )
      .execute()
    return { error: null }
  })

export const duplicateCircleHabit = createServerFn({ method: "POST" })
  .validator((data: { habitId: string; organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, habitId: null }
    }

    const newId = crypto.randomUUID()
    const now = new Date().toISOString()
    await sql`
      INSERT INTO "habit" (
        "id", "userId", "categoryId", "name", "description", "target",
        "reminderTime", "freezesTotal", "startedAt", "archivedAt",
        "archivedNote", "sourceHabitId", "createdAt", "updatedAt"
      )
      SELECT ${newId}, ${session.user.id}, NULL, h."name", h."description", h."target",
             h."reminderTime", h."freezesTotal", ${now}, NULL,
             NULL, h."id", ${now}, ${now}
      FROM "habit" h
      INNER JOIN "circle_habit" ch ON ch."habitId" = h."id" AND ch."organizationId" = ${data.organizationId}
      WHERE h."id" = ${data.habitId}
        AND h."archivedAt" IS NULL
        AND h."userId" <> ${session.user.id}
        AND EXISTS (SELECT 1 FROM "member" m WHERE m."organizationId" = ${data.organizationId} AND m."userId" = ${session.user.id})
        AND NOT EXISTS (SELECT 1 FROM "habit" mine WHERE mine."userId" = ${session.user.id} AND mine."sourceHabitId" = h."id" AND mine."archivedAt" IS NULL)
    `.execute(db)

    const created = await db
      .selectFrom("habit")
      .select("id")
      .where("id", "=", newId)
      .executeTakeFirst()
    if (!created) {
      return {
        error: { message: "This habit can't be added to your list." },
        habitId: null,
      }
    }

    await sql`
      INSERT INTO "habit_schedule_day" ("id", "habitId", "dayOfWeek")
      SELECT ${newId} || '-day-' || "dayOfWeek", ${newId}, "dayOfWeek"
      FROM "habit_schedule_day"
      WHERE "habitId" = ${data.habitId}
    `.execute(db)

    await syncReminderSchedule(session.user.id)
    return { error: null, habitId: newId }
  })
