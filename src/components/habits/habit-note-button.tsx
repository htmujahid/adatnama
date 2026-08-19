import { useState } from "react"
import { and, eq, useLiveQuery } from "@tanstack/react-db"
import { NotebookPenIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { setCheckinNote } from "@/lib/checkins"
import {
  checkinsCollection,
  useCheckinsCollection,
} from "@/lib/collection/checkins"
import { useOfflineExecutor } from "@/lib/db/offline"
import { dateKey } from "@/lib/habits"
import { cn } from "@/lib/utils"

export function HabitNoteButton({
  habitId,
  habitName,
  className,
}: {
  habitId: string
  habitName: string
  className?: string
}) {
  const executor = useOfflineExecutor()
  const collection = useCheckinsCollection()
  const todayKey = dateKey(new Date())
  const { data: todayCheckins = [] } = useLiveQuery({
    query: (q) =>
      q
        .from({ checkin: checkinsCollection })
        .where(({ checkin }) =>
          and(eq(checkin.habitId, habitId), eq(checkin.date, todayKey)),
        ),
  })
  const existing = todayCheckins.at(0)
  const note = existing?.note ?? ""
  const [draft, setDraft] = useState(note)
  const [open, setOpen] = useState(false)

  function save() {
    setCheckinNote({ executor, collection, todayKey }, habitId, existing, draft)
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setDraft(note)
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={note ? "Edit note" : "Add a note"}
            title={note ? "Edit note" : "Add a note"}
            className={className}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <NotebookPenIcon
          className={cn(note ? "text-primary" : "text-muted-foreground")}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <PopoverHeader>
          <PopoverTitle>Note</PopoverTitle>
          <PopoverDescription>{habitName} · today</PopoverDescription>
        </PopoverHeader>
        <Textarea
          autoFocus
          placeholder="How did it go?"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault()
              save()
            }
          }}
          rows={3}
        />
        <div className="flex items-center justify-end gap-2">
          {note && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCheckinNote(
                  { executor, collection, todayKey },
                  habitId,
                  existing,
                  "",
                )
                setDraft("")
                setOpen(false)
              }}
            >
              Clear
            </Button>
          )}
          <Button type="button" size="sm" onClick={save}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
