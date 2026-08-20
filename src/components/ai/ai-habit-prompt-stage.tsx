"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  ResponsiveDialogBody,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Textarea } from "@/components/ui/textarea"
import { QUICK_PROMPTS } from "@/lib/ai/habit-suggestions"

export function AiHabitPromptStage({
  onSubmit,
}: {
  onSubmit: (topic: string) => void
}) {
  const [draft, setDraft] = React.useState("")

  const submit = (text: string) => {
    const value = text.trim()
    if (!value) return
    onSubmit(value)
  }

  return (
    <>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Habit assistant</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          Tell me what you want to build — I'll turn it into a habit.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>
      <ResponsiveDialogBody className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => submit(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="I want to build a morning routine..."
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </ResponsiveDialogBody>
      <ResponsiveDialogFooter className="max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          disabled={!draft.trim()}
          onClick={() => submit(draft)}
        >
          Continue
        </Button>
      </ResponsiveDialogFooter>
    </>
  )
}
