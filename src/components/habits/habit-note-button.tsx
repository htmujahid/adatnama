import { useState } from "react"
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
import {
  setHabitCheckInNote,
  useHabitCheckInNote,
} from "@/hooks/use-habit-checkins"
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
  const note = useHabitCheckInNote(habitId)
  const [draft, setDraft] = useState(note)
  const [open, setOpen] = useState(false)

  function save() {
    setHabitCheckInNote(habitId, draft.trim())
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
                setHabitCheckInNote(habitId, "")
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
