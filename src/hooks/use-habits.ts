import { useMemo } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { parseISO } from "date-fns"

import { getCheckinsCollection } from "@/lib/data/checkins"
import type { CheckinRecord } from "@/lib/data/checkins"
import { useCollection } from "@/lib/data/collection"
import { getHabitsCollection } from "@/lib/data/habits"
import type { HabitRecord } from "@/lib/data/habits"
import { computeHabitStats, dateKey } from "@/lib/habits"
import type { HabitStats } from "@/lib/habits"

export type HabitView = HabitRecord & HabitStats

const EMPTY_DONE_DATES: ReadonlySet<string> = new Set()

export function useHabits(): {
  habits: Array<HabitView>
  checkins: Array<CheckinRecord>
  isLoading: boolean
} {
  const habitsCollection = useCollection(getHabitsCollection)
  const checkinsCollection = useCollection(getCheckinsCollection)
  const { data: habitRecords = [], isLoading: habitsLoading } = useLiveQuery(
    (q) => {
      if (!habitsCollection) return undefined
      return q.from({ habit: habitsCollection })
    },
  )
  const { data: checkins = [], isLoading: checkinsLoading } = useLiveQuery(
    (q) => {
      if (!checkinsCollection) return undefined
      return q.from({ checkin: checkinsCollection })
    },
  )
  const todayKey = dateKey(new Date())

  const habits = useMemo(() => {
    const today = parseISO(todayKey)
    const doneDatesByHabitId = new Map<string, Set<string>>()
    for (const checkin of checkins) {
      if (checkin.status !== "done") continue
      let dates = doneDatesByHabitId.get(checkin.habitId)
      if (!dates) {
        dates = new Set()
        doneDatesByHabitId.set(checkin.habitId, dates)
      }
      dates.add(checkin.date)
    }
    return habitRecords.map((record) => ({
      ...record,
      ...computeHabitStats(
        record,
        doneDatesByHabitId.get(record.id) ?? EMPTY_DONE_DATES,
        today,
      ),
    }))
  }, [habitRecords, checkins, todayKey])

  return {
    habits,
    checkins,
    isLoading:
      !habitsCollection ||
      !checkinsCollection ||
      habitsLoading ||
      checkinsLoading,
  }
}

export function useActiveHabits(): {
  habits: Array<HabitView>
  checkins: Array<CheckinRecord>
  isLoading: boolean
} {
  const { habits, checkins, isLoading } = useHabits()
  return {
    habits: useMemo(
      () => habits.filter((habit) => habit.archivedAt === null),
      [habits],
    ),
    checkins,
    isLoading,
  }
}

export function useHabit(habitId: string): {
  habit: HabitView | undefined
  isLoading: boolean
} {
  const { habits, isLoading } = useHabits()
  return { habit: habits.find((habit) => habit.id === habitId), isLoading }
}
