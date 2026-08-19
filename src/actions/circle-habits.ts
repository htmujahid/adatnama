import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { sql } from "kysely"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { dateKey } from "@/lib/habits"
import { syncReminderSchedule } from "@/lib/reminders"

export type CircleSharedHabit = {
  id: string
  name: string
  description: string
  target: string
  reminderTime: string | null
  days: Array<number>
  streak: number
  doneToday: number
}

export type CircleMemberHabits = {
  ownerUserId: string
  ownerName: string
  habits: Array<CircleSharedHabit>
}

export const listCircleHabits = createServerFn({ method: "GET" })
  .validator((data: { organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, members: null }
    }

    const todayKey = dateKey(new Date())
    const result = await sql<{ payload: string | null }>`
      WITH RECURSIVE
        shared AS (
          SELECT h."id", h."userId", h."name", h."description", h."target",
                 h."reminderTime", h."freezesTotal", h."startedAt",
                 u."name" AS "ownerName", ch."createdAt" AS "sharedAt",
                 om."createdAt" AS "memberSince"
          FROM "circle_habit" ch
          INNER JOIN "habit" h ON h."id" = ch."habitId" AND h."archivedAt" IS NULL
          INNER JOIN "user" u ON u."id" = h."userId"
          INNER JOIN "member" om ON om."organizationId" = ch."organizationId" AND om."userId" = h."userId"
          WHERE ch."organizationId" = ${data.organizationId}
        ),
        fold("habitId", "freezesTotal", "d", "streak", "freezesUsed") AS (
          SELECT s."id", s."freezesTotal",
                 date(min(substr(s."startedAt", 1, 10), ${todayKey}), '-1 day'),
                 0, 0
          FROM shared s
          UNION ALL
          SELECT f."habitId", f."freezesTotal", date(f."d", '+1 day'),
            CASE
              WHEN EXISTS (SELECT 1 FROM "habit_checkin" c WHERE c."habitId" = f."habitId" AND c."date" = date(f."d", '+1 day') AND c."status" = 'done')
                THEN f."streak" + 1
              WHEN EXISTS (SELECT 1 FROM "habit_schedule_day" sd WHERE sd."habitId" = f."habitId" AND sd."dayOfWeek" = CAST(strftime('%w', date(f."d", '+1 day')) AS INTEGER))
                AND date(f."d", '+1 day') <> ${todayKey}
                THEN CASE WHEN f."streak" > 0 AND f."freezesUsed" < f."freezesTotal" THEN f."streak" ELSE 0 END
              ELSE f."streak"
            END,
            CASE
              WHEN EXISTS (SELECT 1 FROM "habit_checkin" c WHERE c."habitId" = f."habitId" AND c."date" = date(f."d", '+1 day') AND c."status" = 'done')
                THEN f."freezesUsed"
              WHEN EXISTS (SELECT 1 FROM "habit_schedule_day" sd WHERE sd."habitId" = f."habitId" AND sd."dayOfWeek" = CAST(strftime('%w', date(f."d", '+1 day')) AS INTEGER))
                AND date(f."d", '+1 day') <> ${todayKey}
                THEN CASE WHEN f."streak" > 0 AND f."freezesUsed" < f."freezesTotal" THEN f."freezesUsed" + 1 ELSE 0 END
              ELSE f."freezesUsed"
            END
          FROM fold f
          WHERE f."d" < ${todayKey}
        )
      SELECT CASE
        WHEN EXISTS (SELECT 1 FROM "member" m WHERE m."organizationId" = ${data.organizationId} AND m."userId" = ${session.user.id})
        THEN (
          SELECT coalesce(json_group_array(json_object(
            'ownerUserId', o."userId",
            'ownerName', o."ownerName",
            'habits', json((
              SELECT coalesce(json_group_array(json_object(
                'id', s."id",
                'name', s."name",
                'description', s."description",
                'target', s."target",
                'reminderTime', s."reminderTime",
                'days', json((
                  SELECT coalesce(json_group_array("dayOfWeek" ORDER BY "dayOfWeek"), '[]')
                  FROM "habit_schedule_day"
                  WHERE "habitId" = s."id"
                )),
                'streak', coalesce((SELECT f."streak" FROM fold f WHERE f."habitId" = s."id" AND f."d" = ${todayKey}), 0),
                'doneToday', EXISTS (SELECT 1 FROM "habit_checkin" c WHERE c."habitId" = s."id" AND c."date" = ${todayKey} AND c."status" = 'done')
              ) ORDER BY s."sharedAt"), '[]')
              FROM shared s
              WHERE s."userId" = o."userId"
            ))
          ) ORDER BY o."memberSince"), '[]')
          FROM (
            SELECT DISTINCT "userId", "ownerName", "memberSince"
            FROM shared
          ) o
        )
        ELSE NULL
      END AS "payload"
    `.execute(db)

    const payload = result.rows[0]?.payload ?? null
    if (payload === null) {
      return {
        error: { message: "You are not a member of this circle." },
        members: null,
      }
    }
    return {
      error: null,
      members: JSON.parse(payload) as Array<CircleMemberHabits>,
    }
  })

export const listHabitShares = createServerFn({ method: "GET" })
  .validator((data: { habitId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    const result = await sql<{ payload: string }>`
      SELECT coalesce(json_group_array(ch."organizationId"), '[]') AS "payload"
      FROM "circle_habit" ch
      INNER JOIN "habit" h ON h."id" = ch."habitId"
      WHERE ch."habitId" = ${data.habitId} AND h."userId" = ${session.user.id}
    `.execute(db)
    return JSON.parse(result.rows[0]?.payload ?? "[]") as Array<string>
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
