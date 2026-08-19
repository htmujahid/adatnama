import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArchiveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"
import type { HabitView } from "@/lib/habits"

export function ArchiveHabitDialog({
  habit,
  open,
  onOpenChange,
}: {
  habit: HabitView
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()
  const [note, setNote] = useState("")

  async function archive() {
    if (!executor) return
    const trimmed = note.trim()
    executor
      .createOfflineTransaction({ mutationFnName: "habits.archive" })
      .mutate(() => {
        habitsCollection.update(habit.id, (draft) => {
          draft.archivedAt = new Date().toISOString()
          draft.archivedNote = trimmed || null
        })
      })
    onOpenChange(false)
    await navigate({ to: "/home/habits/archived" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {habit.name}?</DialogTitle>
          <DialogDescription>
            Archived habits stop counting toward your streaks. You can restore
            them anytime.
          </DialogDescription>
        </DialogHeader>
        <Field className="mt-4">
          <FieldLabel htmlFor="archive-note">Note</FieldLabel>
          <Textarea
            id="archive-note"
            placeholder="Paused for winter — will revisit in spring."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
          />
          <FieldDescription>
            Optional — a reminder of why you're pausing this habit.
          </FieldDescription>
        </Field>
        <DialogFooter className="mt-6">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="button" onClick={archive}>
            <ArchiveIcon />
            Archive habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
