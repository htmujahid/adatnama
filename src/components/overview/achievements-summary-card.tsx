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
import { useAchievements } from "@/hooks/use-achievements"
import { cn } from "@/lib/utils"

export function AchievementsSummaryCard() {
  const { achievements, unlockedCount, isLoading } = useAchievements()

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
