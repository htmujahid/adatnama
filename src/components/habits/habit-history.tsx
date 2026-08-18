import { SnowflakeIcon } from "lucide-react"

import type { HabitDayState } from "@/lib/habits"
import { cn } from "@/lib/utils"

export const HISTORY_LEGEND = [
  { state: "done", label: "Done", className: "bg-primary" },
  { state: "frozen", label: "Frozen", className: "bg-sky-400 dark:bg-sky-500" },
  { state: "missed", label: "Missed", className: "bg-muted" },
] as const

export function HistoryGrid({
  history,
  cellClassName,
}: {
  history: ReadonlyArray<HabitDayState>
  cellClassName?: string
}) {
  return (
    <div
      className="grid grid-flow-col grid-rows-7 gap-1"
      role="img"
      aria-label="Last 4 weeks of check-ins"
    >
      {history.map((state, index) => (
        <span
          key={index}
          title={state === "today" ? "Today" : state}
          className={cn(
            "size-3 rounded-sm",
            state === "done" && "bg-primary",
            state === "missed" && "bg-muted",
            state === "frozen" && "bg-sky-400 dark:bg-sky-500",
            state === "today" && "bg-muted ring-2 ring-primary/40",
            cellClassName,
          )}
        />
      ))}
    </div>
  )
}

export function FreezePips({ total, left }: { total: number; left: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, index) => (
        <SnowflakeIcon
          key={index}
          className={cn(
            "size-3.5",
            index < left ? "text-sky-500" : "text-muted-foreground/25",
          )}
        />
      ))}
    </div>
  )
}
