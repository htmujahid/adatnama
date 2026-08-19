import { createFileRoute } from "@tanstack/react-router"

import { PageHeader } from "@/components/layouts/page-header"
import { StreaksList } from "@/components/streaks/streaks-list"
import { StreaksStatsCards } from "@/components/streaks/streaks-stats-cards"

export const Route = createFileRoute("/home/streaks")({
  component: StreaksPage,
})

function StreaksPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Streaks"
        description="Keep your momentum going, one day at a time."
      />

      <StreaksStatsCards />

      <StreaksList />
    </div>
  )
}
