import { useRef } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useVirtualizer } from "@tanstack/react-virtual"
import { format } from "date-fns"
import { CalendarCheckIcon, ClockIcon } from "lucide-react"

import {
  Card,
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
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { checkinsCollection } from "@/lib/collection/checkins"

const ROW_HEIGHT = 60

export function HabitHistoryList({ habitId }: { habitId: string }) {
  const { data: checkins = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) => eq(checkin.habitId, habitId)),
  })
  const sorted = checkins.toSorted((a, b) => b.date.localeCompare(a.date))

  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  return (
    <Card className="min-h-0 lg:h-full">
      <CardHeader>
        <CardTitle>Check-in log</CardTitle>
        <CardDescription>
          Every check-in recorded for this habit
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 lg:relative lg:px-0">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <Empty className="gap-2 p-4">
            <EmptyHeader className="gap-1">
              <EmptyMedia
                variant="icon"
                className="mb-1 size-8 [&_svg:not([class*='size-'])]:size-4"
              >
                <CalendarCheckIcon />
              </EmptyMedia>
              <EmptyTitle className="text-sm">No check-ins yet</EmptyTitle>
              <EmptyDescription className="text-xs">
                Check off this habit to start building its history.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div
            ref={scrollRef}
            className="h-[420px] overflow-y-auto pr-1 lg:absolute lg:inset-0 lg:h-auto lg:px-(--card-spacing)"
          >
            <div
              style={{
                height: virtualizer.getTotalSize(),
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const checkin = sorted[virtualRow.index]
                return (
                  <div
                    key={checkin.id}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className="pb-2.5"
                  >
                    <Item variant="outline" size="sm">
                      <ItemMedia>
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                          {checkin.status === "done" ? (
                            <CalendarCheckIcon className="size-3.5" />
                          ) : (
                            <ClockIcon className="size-3.5" />
                          )}
                        </span>
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {format(
                            new Date(`${checkin.date}T00:00:00`),
                            "EEE, MMM d, yyyy",
                          )}
                        </ItemTitle>
                        <ItemDescription>
                          {checkin.status === "done" ? "Done" : "Pending"}
                          {checkin.note ? ` — "${checkin.note}"` : ""}
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
