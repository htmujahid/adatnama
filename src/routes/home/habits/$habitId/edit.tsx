import { createFileRoute } from "@tanstack/react-router"

import { EditHabitCard } from "@/components/habits/edit-habit-card"
import { EditHabitHeader } from "@/components/habits/edit-habit-header"

export const Route = createFileRoute("/home/habits/$habitId/edit")({
  component: EditHabitPage,
})

function EditHabitPage() {
  const { habitId } = Route.useParams()
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <EditHabitHeader habitId={habitId} />
      <EditHabitCard habitId={habitId} />
    </div>
  )
}
