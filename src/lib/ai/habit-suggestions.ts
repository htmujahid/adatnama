import { HABIT_DAY_PRESETS } from "@/lib/habits"

export type HabitDraft = {
  title: string
  description: string
  target: string
  schedule: string
  categoryId: string
  categoryName: string
  freezesTotal: number
}

export const SCHEDULE_HINTS: Record<string, string> = {
  daily: "Best for building consistency fast.",
  weekdays: "Best for work-week routines.",
  weekends: "Best for lighter, weekend-only habits.",
}

export const QUICK_PROMPTS = [
  "Build a morning routine",
  "Track a daily reading habit",
  "Start a workout streak",
]

export function scheduleLabel(id: string): string {
  return HABIT_DAY_PRESETS.find((preset) => preset.id === id)?.label ?? id
}
