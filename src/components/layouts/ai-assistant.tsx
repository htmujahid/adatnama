"use client"

import * as React from "react"
import { useHotkey } from "@tanstack/react-hotkeys"
import { SparklesIcon } from "lucide-react"

import { AiHabitPlanner } from "@/components/ai/ai-habit-planner"
import { Button } from "@/components/ui/button"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog"
import { getHotkeyReference } from "@/lib/hotkeys"

export function AiAssistant() {
  const [open, setOpen] = React.useState(false)

  useHotkey(getHotkeyReference("ai-assistant").hotkey!, () => {
    setOpen((value) => !value)
  })

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger
        render={<Button variant="outline" size="sm" aria-label="Ask AI" />}
      >
        <SparklesIcon />
        <span className="hidden sm:inline">Ask AI</span>
      </ResponsiveDialogTrigger>

      <ResponsiveDialogContent className="sm:max-w-lg">
        <AiHabitPlanner onRequestClose={() => setOpen(false)} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
