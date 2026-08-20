import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/layouts/page-header"
import { AchievementsSummaryCard } from "@/components/overview/achievements-summary-card"
import { CirclesSummaryCard } from "@/components/overview/circles-summary-card"
import { LevelCard } from "@/components/overview/level-card"
import { TodayHabitsCard } from "@/components/overview/today-habits-card"
import { TodayStatCard } from "@/components/overview/today-stat-card"
import { WeeklyActivityCard } from "@/components/overview/weekly-activity-card"
import { WeeklyRateCard } from "@/components/overview/weekly-rate-card"
import { useHomeUser } from "@/hooks/use-home-user"

export const Route = createFileRoute("/home/")({ component: HomePage })

function HomePage() {
  const user = useHomeUser()
  const firstName = user.name.split(" ")[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title={<>Welcome back, {firstName}</>}
        description="Here's how your habits are doing."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TodayStatCard />
        <WeeklyRateCard />
        <LevelCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <TodayHabitsCard />
        <CirclesSummaryCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WeeklyActivityCard />
        <AchievementsSummaryCard />
      </div>
    </div>
  )
}
