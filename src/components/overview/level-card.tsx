import { eq, useLiveQuery } from "@tanstack/react-db"
import { ZapIcon } from "lucide-react"

import { StatCard } from "@/components/overview/stat-card"
import { achievementUnlocksCollection } from "@/lib/collection/achievements"
import { checkinsCollection } from "@/lib/collection/checkins"

export function LevelCard() {
  const { data: doneCheckins = [], isLoading: checkinsLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) => eq(checkin.status, "done")),
  })
  const { data: unlocks = [], isLoading: unlocksLoading } = useLiveQuery({
    query: (q) => q.from({ unlock: achievementUnlocksCollection }),
  })
  const isLoading = checkinsLoading || unlocksLoading

  const xp = doneCheckins.length * 10 + unlocks.length * 50
  const level = 1 + Math.floor(xp / 200)

  return (
    <StatCard
      label="Level"
      value={`${level}`}
      badge={`${xp} XP`}
      icon={ZapIcon}
      isLoading={isLoading}
    />
  )
}
