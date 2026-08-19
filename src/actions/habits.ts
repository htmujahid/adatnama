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

async function selectHabit(
  id: string,
  userId: string,
): Promise<HabitRow | null> {
  const row = await db
    .selectFrom("habit")
    .selectAll()
    .where("id", "=", id)
    .where("userId", "=", userId)
    .executeTakeFirst()
  if (!row) return null
  const days = await db
    .selectFrom("habit_schedule_day")
    .select("dayOfWeek")
    .where("habitId", "=", id)
    .orderBy("dayOfWeek")
    .execute()
  return { ...row, days: days.map((day) => day.dayOfWeek) }
}

async function replaceScheduleDays(habitId: string, days: Array<number>) {
  await db
    .deleteFrom("habit_schedule_day")
    .where("habitId", "=", habitId)
    .execute()
  if (days.length === 0) return
  await sql`
    insert into "habit_schedule_day" ("id", "habitId", "dayOfWeek")
    select ${habitId} || '-day-' || "value", ${habitId}, "value"
    from json_each(${JSON.stringify(days)})
  `.execute(db)
}

export const listHabits = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<HabitRow>> => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    const habits = await db
      .selectFrom("habit")
      .selectAll()
      .where("userId", "=", session.user.id)
      .orderBy("createdAt")
      .execute()
    if (habits.length === 0) return []

    const days = await db
      .selectFrom("habit_schedule_day")
      .innerJoin("habit", "habit.id", "habit_schedule_day.habitId")
      .select(["habit_schedule_day.habitId", "habit_schedule_day.dayOfWeek"])
      .where("habit.userId", "=", session.user.id)
      .orderBy("habit_schedule_day.dayOfWeek")
      .execute()
    const daysByHabit = new Map<string, Array<number>>()
    for (const day of days) {
      const list = daysByHabit.get(day.habitId) ?? []
      list.push(day.dayOfWeek)
      daysByHabit.set(day.habitId, list)
    }

    return habits.map((habit) => ({
      ...habit,
      days: daysByHabit.get(habit.id) ?? [],
    }))
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
