import { createFileRoute } from "@tanstack/react-router"

import { AchievementsList } from "@/components/achievements/achievements-list"
import { AchievementsStatsCards } from "@/components/achievements/achievements-stats-cards"
import { PageHeader } from "@/components/layouts/page-header"

export const Route = createFileRoute("/home/achievements")({
  component: AchievementsPage,
})

function AchievementsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Achievements"
        description="Badges you've earned along the way."
      />

      <AchievementsStatsCards />

      <AchievementsList />
    </div>
  )
}
