import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { LockIcon } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

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
  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          {unlockedCount} of {achievements.length} unlocked
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
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <div className="flex gap-3 pb-1">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  title={achievement.description}
                  className={cn(
                    "flex w-24 shrink-0 flex-col items-center gap-2 rounded-lg border border-border p-3 text-center",
                    !achievement.unlocked && "opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      achievement.unlocked
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {achievement.unlocked ? (
                      <achievement.icon className="size-5" />
                    ) : (
                      <LockIcon className="size-4" />
                    )}
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
