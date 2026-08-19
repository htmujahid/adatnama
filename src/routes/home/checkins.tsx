import { createFileRoute } from "@tanstack/react-router"

import { CheckinsCalendarCard } from "@/components/checkins/checkins-calendar-card"
import { CheckinsStatsCards } from "@/components/checkins/checkins-stats-cards"
import { CheckinsWeekActivityCard } from "@/components/checkins/checkins-week-activity-card"
import { PageHeader } from "@/components/layouts/page-header"

export const Route = createFileRoute("/home/checkins")({
  component: CheckInsPage,
})

function CheckInsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Check-ins"
        description="A log of every habit you've checked off."
      />

      <CheckinsStatsCards />

      <div className="grid gap-4 lg:grid-cols-3">
        <CheckinsCalendarCard />
        <CheckinsWeekActivityCard />
      </div>
    </div>
  )
}
