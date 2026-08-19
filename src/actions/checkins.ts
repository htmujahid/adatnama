import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { subDays } from "date-fns"
import { sql } from "kysely"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { HabitCheckinTable } from "@/lib/db/schema"
import { dateKey } from "@/lib/habits"

const CHECKIN_WINDOW_DAYS = 371

export type CheckinStatus = "done" | "pending"

export type CheckinInput = {
  id: string
  habitId: string
  date: string
  status: CheckinStatus
  note: string | null
}

function checkinWindow(): { todayKey: string; windowStartKey: string } {
  const today = new Date()
  return {
    todayKey: dateKey(today),
    windowStartKey: dateKey(subDays(today, CHECKIN_WINDOW_DAYS)),
  }
}

export const listCheckins = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    const { todayKey, windowStartKey } = checkinWindow()
    const result = await sql<HabitCheckinTable>`
      WITH RECURSIVE
        fold("habitId", "freezesTotal", "d", "streak", "freezesUsed", "runStart") AS (
          SELECT h."id", h."freezesTotal",
                 date(min(substr(h."startedAt", 1, 10), ${todayKey}), '-1 day'),
                 0, 0, NULL
          FROM "habit" h
          WHERE h."userId" = ${session.user.id}
          UNION ALL
          SELECT f."habitId", f."freezesTotal", date(f."d", '+1 day'),
            CASE
              WHEN EXISTS (SELECT 1 FROM "habit_checkin" c WHERE c."habitId" = f."habitId" AND c."date" = date(f."d", '+1 day') AND c."status" = 'done')
                THEN f."streak" + 1
              WHEN EXISTS (SELECT 1 FROM "habit_schedule_day" s WHERE s."habitId" = f."habitId" AND s."dayOfWeek" = CAST(strftime('%w', date(f."d", '+1 day')) AS INTEGER))
                AND date(f."d", '+1 day') <> ${todayKey}
                THEN CASE WHEN f."streak" > 0 AND f."freezesUsed" < f."freezesTotal" THEN f."streak" ELSE 0 END
              ELSE f."streak"
            END,
            CASE
              WHEN EXISTS (SELECT 1 FROM "habit_checkin" c WHERE c."habitId" = f."habitId" AND c."date" = date(f."d", '+1 day') AND c."status" = 'done')
                THEN f."freezesUsed"
              WHEN EXISTS (SELECT 1 FROM "habit_schedule_day" s WHERE s."habitId" = f."habitId" AND s."dayOfWeek" = CAST(strftime('%w', date(f."d", '+1 day')) AS INTEGER))
                AND date(f."d", '+1 day') <> ${todayKey}
                THEN CASE WHEN f."streak" > 0 AND f."freezesUsed" < f."freezesTotal" THEN f."freezesUsed" + 1 ELSE 0 END
              ELSE f."freezesUsed"
            END,
            CASE
              WHEN EXISTS (SELECT 1 FROM "habit_checkin" c WHERE c."habitId" = f."habitId" AND c."date" = date(f."d", '+1 day') AND c."status" = 'done')
                THEN CASE WHEN f."streak" = 0 THEN date(f."d", '+1 day') ELSE f."runStart" END
              WHEN EXISTS (SELECT 1 FROM "habit_schedule_day" s WHERE s."habitId" = f."habitId" AND s."dayOfWeek" = CAST(strftime('%w', date(f."d", '+1 day')) AS INTEGER))
                AND date(f."d", '+1 day') <> ${todayKey}
                THEN CASE WHEN f."streak" > 0 AND f."freezesUsed" < f."freezesTotal" THEN f."runStart" ELSE NULL END
              ELSE f."runStart"
            END
          FROM fold f
          WHERE f."d" < ${todayKey}
        ),
        tails AS (
          SELECT "habitId", "runStart"
          FROM fold
          WHERE "d" = ${todayKey}
            AND "streak" > 0
            AND "runStart" IS NOT NULL
            AND "runStart" < ${windowStartKey}
        )
      SELECT c.*
      FROM "habit_checkin" c
      INNER JOIN "habit" h ON h."id" = c."habitId"
      WHERE h."userId" = ${session.user.id}
        AND c."date" >= ${windowStartKey}
      UNION ALL
      SELECT c.*
      FROM "habit_checkin" c
      INNER JOIN tails t ON t."habitId" = c."habitId" AND c."date" >= t."runStart"
      WHERE c."date" < ${windowStartKey}
      ORDER BY "date"
    `.execute(db)
    return result.rows
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
