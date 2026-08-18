import { CircleCheckIcon, CircleXIcon, TriangleAlertIcon } from "lucide-react"

export const MILESTONES = [7, 30, 100] as const

export type HabitStatus = "active" | "at-risk" | "broken"

export function habitStatus(habit: {
  doneToday: boolean
  streak: number
}): HabitStatus {
  if (habit.streak === 0) return "broken"
  return habit.doneToday ? "active" : "at-risk"
}

export const STATUS_META = {
  active: {
    label: "Active",
    icon: CircleCheckIcon,
    badgeVariant: "secondary" as const,
  },
  "at-risk": {
    label: "At risk",
    icon: TriangleAlertIcon,
    badgeVariant: "outline" as const,
  },
  broken: {
    label: "Broken",
    icon: CircleXIcon,
    badgeVariant: "destructive" as const,
  },
} satisfies Record<
  HabitStatus,
  {
    label: string
    icon: typeof CircleCheckIcon
    badgeVariant: "secondary" | "outline" | "destructive"
  }
>
