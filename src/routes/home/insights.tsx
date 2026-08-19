import { createFileRoute } from "@tanstack/react-router"

import { InsightsCharts } from "@/components/insights/insights-charts"
import { PageHeader } from "@/components/layouts/page-header"

export const Route = createFileRoute("/home/insights")({
  component: InsightsPage,
})

function InsightsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Insights"
        description="Trends and patterns across your habits."
      />

      <InsightsCharts />
    </div>
  )
}
