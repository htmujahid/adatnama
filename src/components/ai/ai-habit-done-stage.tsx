"use client"

import { Link } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  ResponsiveDialogBody,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { scheduleLabel } from "@/lib/ai/habit-suggestions"
import type { HabitDraft } from "@/lib/ai/habit-suggestions"

export function AiHabitDoneStage({
  draft,
  habitId,
  onStartOver,
  onRequestClose,
}: {
  draft: HabitDraft
  habitId: string
  onStartOver: () => void
  onRequestClose: () => void
}) {
  return (
    <>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Habit created</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          "{draft.title}" is ready to track.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>
      <ResponsiveDialogBody>
        <Item variant="outline" size="sm">
          <ItemMedia variant="icon">
            <ListChecksIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{draft.title}</ItemTitle>
            <ItemDescription>{draft.description}</ItemDescription>
            <ItemDescription>Target: {draft.target}</ItemDescription>
            <ItemDescription>
              {scheduleLabel(draft.schedule)} · {draft.categoryName} ·{" "}
              {draft.freezesTotal}{" "}
              {draft.freezesTotal === 1 ? "freeze" : "freezes"}
            </ItemDescription>
          </ItemContent>
        </Item>
      </ResponsiveDialogBody>
      <ResponsiveDialogFooter className="max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button type="button" variant="outline" onClick={onStartOver}>
          Start over
        </Button>
        <Button
          type="button"
          nativeButton={false}
          render={
            <Link
              to="/home/habits/$habitId"
              params={{ habitId }}
              onClick={onRequestClose}
            />
          }
        >
          View habit
        </Button>
      </ResponsiveDialogFooter>
    </>
  )
}
