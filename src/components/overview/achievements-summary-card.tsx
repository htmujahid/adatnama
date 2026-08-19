import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { TrophyIcon } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ACHIEVEMENT_DEFINITIONS,
  buildAchievementContext,
} from "@/lib/achievements"
import { achievementUnlocksCollection } from "@/lib/collection/achievements"
import { checkinsCollection } from "@/lib/collection/checkins"
import { circlesCollection } from "@/lib/collection/circles"
import { habitsCollection } from "@/lib/collection/habits"
import { computeHabitStats } from "@/lib/habits"

const EMPTY_DONE_DATES: ReadonlySet<string> = new Set()

export function AchievementsSummaryCard() {
  const today = new Date()

  const { data: habitCheckinRows = [], isLoading: habitsLoading } =
    useLiveQuery((q) =>
      q.from({ habit: habitsCollection }).leftJoin(
        {
          checkin: q
            .from({ checkin: checkinsCollection })
            .where(({ checkin }) => eq(checkin.status, "done")),
        },
        ({ habit, checkin }) => eq(checkin.habitId, habit.id),
      ),
    )
  const { data: circles = [], isLoading: circlesLoading } = useLiveQuery((q) =>
    q.from({ circle: circlesCollection }),
  )
  const { data: unlocks = [], isLoading: unlocksLoading } = useLiveQuery((q) =>
    q.from({ unlock: achievementUnlocksCollection }),
  )
  const isLoading = habitsLoading || circlesLoading || unlocksLoading

  const habitById = new Map<
    string,
    (typeof habitCheckinRows)[number]["habit"]
  >()
  const doneDates = new Map<string, Set<string>>()
  for (const { habit, checkin } of habitCheckinRows) {
    habitById.set(habit.id, habit)
    if (!checkin) continue
    let dates = doneDates.get(habit.id)
    if (!dates) {
      dates = new Set()
      doneDates.set(habit.id, dates)
    }
    dates.add(checkin.date)
  }
  const doneCountByHabitId = new Map<string, number>()
  for (const [habitId, dates] of doneDates) {
    doneCountByHabitId.set(habitId, dates.size)
  }
  const habits = Array.from(habitById.values(), (record) => ({
    ...record,
    ...computeHabitStats(
      record,
      doneDates.get(record.id) ?? EMPTY_DONE_DATES,
      today,
    ),
  }))
  const context = buildAchievementContext({
    habits,
    doneCountByHabitId,
    circleCount: circles.length,
    today,
  })
  const achievements = ACHIEVEMENT_DEFINITIONS.map(
    ({ compute, ...definition }) => ({
      ...definition,
      unlocked:
        compute(context).achieved ||
        unlocks.some((unlock) => unlock.achievementId === definition.id),
    }),
  )
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  )

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          {unlockedAchievements.length} of {achievements.length} unlocked
        </CardDescription>
        <CardAction>
          <Link
            to="/home/achievements"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex gap-3 pb-1">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-24 shrink-0 rounded-lg" />
            ))}
          </div>
        ) : unlockedAchievements.length === 0 ? (
          <Empty className="gap-2 p-4">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="mb-1 size-8 [&_svg:not([class*='size-'])]:size-4"
              >
                <TrophyIcon />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No achievements yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                Keep building your habits to unlock badges.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <div className="flex gap-3 pb-1">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  title={achievement.description}
                  className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-lg border border-border p-3 text-center"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <achievement.icon className="size-5" />
                  </div>
                  <span className="text-xs font-medium">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
