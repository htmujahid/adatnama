import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { sql } from "kysely"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { HabitTable } from "@/lib/db/schema"
import { syncReminderSchedule } from "@/lib/reminders"

export type HabitInput = {
  categoryId: string | null
  name: string
  description: string
  target: string
  reminderTime: string | null
  freezesTotal: number
  days: Array<number>
}

export type HabitRow = HabitTable & { days: Array<number> }

const daysJson = sql<string>`(
  select coalesce(json_group_array("dayOfWeek"), '[]')
  from "habit_schedule_day"
  where "habit_schedule_day"."habitId" = "habit"."id"
)`

function parseDays(days: string): Array<number> {
  return (JSON.parse(days) as Array<number>).sort((a, b) => a - b)
}

async function selectHabit(
  id: string,
  userId: string,
): Promise<HabitRow | null> {
  const row = await db
    .selectFrom("habit")
    .selectAll("habit")
    .select(daysJson.as("days"))
    .where("id", "=", id)
    .where("userId", "=", userId)
    .executeTakeFirst()
  if (!row) return null
  return { ...row, days: parseDays(row.days) }
}

async function replaceScheduleDays(habitId: string, days: Array<number>) {
  await db
    .deleteFrom("habit_schedule_day")
    .where("habitId", "=", habitId)
    .execute()
  if (days.length === 0) return
  await db
    .insertInto("habit_schedule_day")
    .values(
      days.map((dayOfWeek) => ({
        id: crypto.randomUUID(),
        habitId,
        dayOfWeek,
      })),
    )
    .execute()
}

export const listHabits = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    const rows = await db
      .selectFrom("habit")
      .selectAll("habit")
      .select(daysJson.as("days"))
      .where("userId", "=", session.user.id)
      .orderBy("createdAt")
      .execute()

    return rows.map((row) => ({ ...row, days: parseDays(row.days) }))
  },
)

export const createHabit = createServerFn({ method: "POST" })
  .validator((data: { id: string; startedAt: string } & HabitInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, habit: null }
    }

    const now = new Date().toISOString()
    await db
      .insertInto("habit")
      .values({
        id: data.id,
        userId: session.user.id,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        target: data.target,
        reminderTime: data.reminderTime,
        freezesTotal: data.freezesTotal,
        startedAt: data.startedAt,
        archivedAt: null,
        archivedNote: null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflict((oc) =>
        oc.column("id").doUpdateSet({
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          target: data.target,
          reminderTime: data.reminderTime,
          freezesTotal: data.freezesTotal,
          updatedAt: now,
        }),
      )
      .execute()
    await replaceScheduleDays(data.id, data.days)

    const habit = await selectHabit(data.id, session.user.id)
    await syncReminderSchedule(session.user.id)
    return { error: null, habit }
  })

export const updateHabit = createServerFn({ method: "POST" })
  .validator((data: { id: string } & HabitInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, habit: null }
    }

    const result = await db
      .updateTable("habit")
      .set({
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        target: data.target,
        reminderTime: data.reminderTime,
        freezesTotal: data.freezesTotal,
        updatedAt: new Date().toISOString(),
      })
      .where("id", "=", data.id)
      .where("userId", "=", session.user.id)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return { error: { message: "Habit not found." }, habit: null }
    }
    await replaceScheduleDays(data.id, data.days)

    const habit = await selectHabit(data.id, session.user.id)
    await syncReminderSchedule(session.user.id)
    return { error: null, habit }
  })

export const archiveHabit = createServerFn({ method: "POST" })
  .validator((data: { id: string; note: string | null }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, habit: null }
    }

    const now = new Date().toISOString()
    const result = await db
      .updateTable("habit")
      .set({ archivedAt: now, archivedNote: data.note, updatedAt: now })
      .where("id", "=", data.id)
      .where("userId", "=", session.user.id)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return { error: { message: "Habit not found." }, habit: null }
    }
    const habit = await selectHabit(data.id, session.user.id)
    await syncReminderSchedule(session.user.id)
    return { error: null, habit }
  })

export const restoreHabit = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, habit: null }
    }

    const result = await db
      .updateTable("habit")
      .set({
        archivedAt: null,
        archivedNote: null,
        updatedAt: new Date().toISOString(),
      })
      .where("id", "=", data.id)
      .where("userId", "=", session.user.id)
      .executeTakeFirst()

    if (result.numUpdatedRows === 0n) {
      return { error: { message: "Habit not found." }, habit: null }
    }
    const habit = await selectHabit(data.id, session.user.id)
    await syncReminderSchedule(session.user.id)
    return { error: null, habit }
  })

export const deleteHabit = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    await db
      .deleteFrom("habit")
      .where("id", "=", data.id)
      .where("userId", "=", session.user.id)
      .execute()

    await syncReminderSchedule(session.user.id)
    return { error: null }
  })
