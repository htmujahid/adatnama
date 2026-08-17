import { createFileRoute, Link } from "@tanstack/react-router"
import { ArchiveIcon, FlameIcon, ListChecksIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/home/habits/archived")({
  component: ArchivedHabitsPage,
})

const ARCHIVED_HABITS: ReadonlyArray<{
  name: string
  category: string
  bestStreak: number
  daysTracked: number
  archivedOn: string
  note: string
}> = [
  {
    name: "Cold showers",
    category: "Wellness",
    bestStreak: 14,
    daysTracked: 21,
    archivedOn: "Jul 12",
    note: "Paused for winter — will revisit in spring.",
  },
  {
    name: "Daily journaling",
    category: "Mindful",
    bestStreak: 32,
    daysTracked: 58,
    archivedOn: "Jun 3",
    note: 'Replaced by the "Read 20 pages" habit.',
  },
]

function ArchivedHabitsPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Archived habits
          </h1>
          <p className="text-sm text-muted-foreground">
            Habits you've paused or retired. Nothing here counts toward your
            current streaks.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/habits" />}
        >
          <ListChecksIcon />
          All habits
        </Button>
      </div>

      {ARCHIVED_HABITS.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            You haven't archived any habits yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {ARCHIVED_HABITS.map((habit) => (
            <Card key={habit.name} className="opacity-80">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{habit.name}</CardTitle>
                    <CardDescription>{habit.category}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    <ArchiveIcon />
                    Archived {habit.archivedOn}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{habit.note}</p>
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="flex items-center gap-1.5">
                    <FlameIcon className="size-4 text-muted-foreground" />
                    <span className="font-semibold tabular-nums">
                      {habit.bestStreak}
                    </span>
                    <span className="text-muted-foreground">day best</span>
                  </span>
                  <span className="text-muted-foreground">
                    Tracked {habit.daysTracked} days
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
