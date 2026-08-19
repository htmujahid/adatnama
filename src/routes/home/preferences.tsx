import { createFileRoute } from "@tanstack/react-router"

import { AppearanceCard } from "@/components/preferences/appearance-card"
import { ClearLocalDataCard } from "@/components/preferences/clear-local-data-card"
import { HabitDefaultsCard } from "@/components/preferences/habit-defaults-card"
import { NotificationsCard } from "@/components/preferences/notifications-card"

export const Route = createFileRoute("/home/preferences")({
  component: PreferencesPage,
})

function PreferencesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <AppearanceCard />
      <HabitDefaultsCard />
      <NotificationsCard />
      <ClearLocalDataCard />
    </div>
  )
}
