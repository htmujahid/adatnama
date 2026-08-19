import { createFileRoute } from "@tanstack/react-router"

import { HabitCirclesCard } from "@/components/habits/habit-circles-card"
import { HabitDetailHeader } from "@/components/habits/habit-detail-header"
import { HabitDetailsCard } from "@/components/habits/habit-details-card"
import { HabitHistoryCard } from "@/components/habits/habit-history-card"
import { HabitMilestonesCard } from "@/components/habits/habit-milestones-card"
import { HabitStatsCards } from "@/components/habits/habit-stats-cards"
import { HabitWeekCard } from "@/components/habits/habit-week-card"

export const Route = createFileRoute("/home/habits/$habitId/")({
  component: HabitDetailPage,
})

function HabitDetailPage() {
  const { habitId } = Route.useParams()
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <HabitDetailHeader habitId={habitId} />
      <HabitStatsCards habitId={habitId} />

      <div className="grid gap-4 lg:grid-cols-3">
        <HabitDetailsCard habitId={habitId} />
        <HabitMilestonesCard habitId={habitId} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <HabitWeekCard habitId={habitId} />
        <HabitHistoryCard habitId={habitId} />
      </div>

      <HabitCirclesCard habitId={habitId} />
    </div>
  )
}
