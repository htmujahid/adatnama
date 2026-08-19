import { buildPushPayload } from "@block65/webcrypto-web-push"
import { DurableObject, env } from "cloudflare:workers"
import { sql } from "kysely"

import { db } from "@/lib/db"
import type { PushSubscriptionTable } from "@/lib/db/schema"
import { reminderMinutes } from "@/lib/habits"

const ALARM_LATE_WINDOW_MS = 15 * 60 * 1000
const RESCHEDULE_MARGIN_MS = 30 * 1000
const PUSH_TTL_SECONDS = 3 * 60 * 60

type ReminderHabit = {
  id: string
  name: string
  target: string
  reminderTime: string
  days: Array<number>
}

type ReminderState = {
  timezone: string
  enabled: boolean
  habits: Array<ReminderHabit>
  doneToday: Set<string>
  subscriptions: Array<PushSubscriptionTable>
}

type WallClock = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

type WallDay = {
  year: number
  month: number
  day: number
  weekday: number
}

function wallClockAt(utcMs: number, timeZone: string): WallClock {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(utcMs))
  const values = new Map(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(values.get("year")),
    month: Number(values.get("month")),
    day: Number(values.get("day")),
    hour: Number(values.get("hour")),
    minute: Number(values.get("minute")),
  }
}

function wallDateTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const target = Date.UTC(year, month - 1, day, hour, minute)
  let guess = target
  for (let iteration = 0; iteration < 2; iteration++) {
    const wall = wallClockAt(guess, timeZone)
    const wallMs = Date.UTC(
      wall.year,
      wall.month - 1,
      wall.day,
      wall.hour,
      wall.minute,
    )
    guess += target - wallMs
  }
  return guess
}

function wallDayPlus(wall: WallClock, offsetDays: number): WallDay {
  const date = new Date(
    Date.UTC(wall.year, wall.month - 1, wall.day + offsetDays),
  )
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    weekday: date.getUTCDay(),
  }
}

function dayKeyOf(day: { year: number; month: number; day: number }): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${day.year}-${pad(day.month)}-${pad(day.day)}`
}

function reminderInstantOn(
  habit: ReminderHabit,
  timeZone: string,
  day: WallDay,
): number | null {
  const minutes = reminderMinutes(habit.reminderTime)
  if (!Number.isFinite(minutes)) return null
  return wallDateTimeToUtc(
    timeZone,
    day.year,
    day.month,
    day.day,
    Math.floor(minutes / 60),
    minutes % 60,
  )
}

function nextReminderInstant(
  habit: ReminderHabit,
  timeZone: string,
  afterMs: number,
  doneToday: ReadonlySet<string>,
): number | null {
  const today = wallClockAt(afterMs, timeZone)
  for (let offset = 0; offset < 8; offset++) {
    const day = wallDayPlus(today, offset)
    if (!habit.days.includes(day.weekday)) continue
    if (offset === 0 && doneToday.has(habit.id)) continue
    const instant = reminderInstantOn(habit, timeZone, day)
    if (instant !== null && instant > afterMs) return instant
  }
  return null
}

async function loadReminderState(userId: string): Promise<ReminderState> {
  const preferences = await db
    .selectFrom("user_preferences")
    .select(["remindersEnabled"])
    .where("userId", "=", userId)
    .executeTakeFirst()
  const subscriptions = await db
    .selectFrom("push_subscription")
    .selectAll()
    .where("userId", "=", userId)
    .execute()
  const daysJson = sql<string>`(
    select coalesce(json_group_array("dayOfWeek"), '[]')
    from "habit_schedule_day"
    where "habit_schedule_day"."habitId" = "habit"."id"
  )`
  const habitRows = await db
    .selectFrom("habit")
    .select(["id", "name", "target", "reminderTime"])
    .select(daysJson.as("days"))
    .where("userId", "=", userId)
    .where("archivedAt", "is", null)
    .where("reminderTime", "is not", null)
    .execute()
  const habits = habitRows.map((row) => ({
    id: row.id,
    name: row.name,
    target: row.target,
    reminderTime: row.reminderTime ?? "",
    days: JSON.parse(row.days) as Array<number>,
  }))

  const timezone = "UTC"
  const todayKey = dayKeyOf(wallClockAt(Date.now(), timezone))
  const doneRows =
    habits.length > 0
      ? await db
          .selectFrom("habit_checkin")
          .select(["habitId"])
          .where(
            "habitId",
            "in",
            habits.map((habit) => habit.id),
          )
          .where("date", "=", todayKey)
          .where("status", "=", "done")
          .execute()
      : []

  return {
    timezone,
    enabled: (preferences?.remindersEnabled ?? 1) === 1,
    habits,
    doneToday: new Set(doneRows.map((row) => row.habitId)),
    subscriptions,
  }
}

async function sendReminderPush(
  subscription: PushSubscriptionTable,
  habit: ReminderHabit,
): Promise<Response> {
  const payload = await buildPushPayload(
    {
      data: {
        title: `Time for ${habit.name}`,
        body: habit.target || "Keep your streak going.",
        url: `/home/habits/${habit.id}`,
        tag: `reminder-${habit.id}`,
      },
      options: {
        ttl: PUSH_TTL_SECONDS,
        urgency: "normal",
        topic: habit.id.replace(/-/g, "").slice(0, 32),
      },
    },
    {
      endpoint: subscription.endpoint,
      expirationTime: null,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    {
      subject: env.VAPID_SUBJECT,
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
    },
  )
  const { body, ...init } = payload
  return fetch(subscription.endpoint, {
    ...init,
    body: new Uint8Array(body).buffer,
  })
}

export class ReminderDurableObject extends DurableObject<Env> {
  async schedule(userId: string): Promise<void> {
    await this.ctx.storage.put("userId", userId)
    const state = await loadReminderState(userId)
    await this.applySchedule(state)
  }

  async alarm(): Promise<void> {
    const userId = await this.ctx.storage.get<string>("userId")
    if (!userId) return
    const state = await loadReminderState(userId)

    if (state.enabled && state.subscriptions.length > 0) {
      const now = Date.now()
      const today = wallDayPlus(wallClockAt(now, state.timezone), 0)
      const due = state.habits.filter((habit) => {
        if (state.doneToday.has(habit.id)) return false
        if (!habit.days.includes(today.weekday)) return false
        const instant = reminderInstantOn(habit, state.timezone, today)
        if (instant === null) return false
        return instant <= now && now - instant <= ALARM_LATE_WINDOW_MS
      })

      for (const habit of due) {
        for (const subscription of state.subscriptions) {
          try {
            const response = await sendReminderPush(subscription, habit)
            if (response.status === 404 || response.status === 410) {
              await db
                .deleteFrom("push_subscription")
                .where("id", "=", subscription.id)
                .execute()
            }
          } catch (error) {
            console.error("Failed to send reminder push", error)
          }
        }
      }
    }

    await this.applySchedule(await loadReminderState(userId))
  }

  private async applySchedule(state: ReminderState): Promise<void> {
    if (
      !state.enabled ||
      state.subscriptions.length === 0 ||
      state.habits.length === 0
    ) {
      await this.ctx.storage.deleteAlarm()
      return
    }
    const afterMs = Date.now() + RESCHEDULE_MARGIN_MS
    let next: number | null = null
    for (const habit of state.habits) {
      const instant = nextReminderInstant(
        habit,
        state.timezone,
        afterMs,
        state.doneToday,
      )
      if (instant !== null && (next === null || instant < next)) {
        next = instant
      }
    }
    if (next === null) {
      await this.ctx.storage.deleteAlarm()
      return
    }
    await this.ctx.storage.setAlarm(next)
  }
}

export async function syncReminderSchedule(userId: string): Promise<void> {
  try {
    const stub = env.REMINDER_DO.get(env.REMINDER_DO.idFromName(userId))
    await stub.schedule(userId)
  } catch (error) {
    console.error("Failed to sync reminder schedule", error)
  }
}
