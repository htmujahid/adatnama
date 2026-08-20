import { createFileRoute } from "@tanstack/react-router"

import { HabitHistoryCalendarCard } from "@/components/habits/habit-history-calendar-card"
import { HabitHistoryHeader } from "@/components/habits/habit-history-header"
import { HabitHistoryList } from "@/components/habits/habit-history-list"
import { HabitHistorySummaryCards } from "@/components/habits/habit-history-summary-cards"

export const Route = createFileRoute("/home/habits/$habitId/history")({
  component: HabitHistoryPage,
})

function HabitHistoryPage() {
  const { habitId } = Route.useParams()
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <HabitHistoryHeader habitId={habitId} />
      <HabitHistorySummaryCards habitId={habitId} />

      <div className="grid gap-4 lg:grid-cols-3">
        <HabitHistoryCalendarCard habitId={habitId} />
        <HabitHistoryList habitId={habitId} />
      </div>
    </div>
  )
}
