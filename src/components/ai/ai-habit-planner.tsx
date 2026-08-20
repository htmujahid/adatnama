"use client"

import * as React from "react"
import { safeRandomUUID } from "@tanstack/react-db"

import { AiHabitDoneStage } from "@/components/ai/ai-habit-done-stage"
import { AiHabitPromptStage } from "@/components/ai/ai-habit-prompt-stage"
import { AiHabitReviewStage } from "@/components/ai/ai-habit-review-stage"
import { useHomeUser } from "@/hooks/use-home-user"
import type { HabitDraft } from "@/lib/ai/habit-suggestions"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"
import { presetDays } from "@/lib/preferences"

type Stage = "prompt" | "review" | "done"

export function AiHabitPlanner({
  onRequestClose,
}: {
  onRequestClose: () => void
}) {
  const [stage, setStage] = React.useState<Stage>("prompt")
  const [topic, setTopic] = React.useState("")
  const [draft, setDraft] = React.useState<HabitDraft | null>(null)
  const [habitId, setHabitId] = React.useState<string | null>(null)

  const user = useHomeUser()
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()

  const resetToPrompt = () => {
    setTopic("")
    setDraft(null)
    setHabitId(null)
    setStage("prompt")
  }

  const createHabit = (value: HabitDraft) => {
    if (!executor) return
    const id = safeRandomUUID()
    const now = new Date().toISOString()
    executor
      .createOfflineTransaction({ mutationFnName: "habits.create" })
      .mutate(() => {
        habitsCollection.insert({
          id,
          userId: user.id,
          categoryId: value.categoryId,
          name: value.title,
          description: value.description,
          target: value.target,
          reminderTime: null,
          freezesTotal: value.freezesTotal,
          days: [...presetDays(value.schedule)],
          startedAt: now,
          archivedAt: null,
          archivedNote: null,
          sourceHabitId: null,
          createdAt: now,
          updatedAt: now,
        })
      })
    setDraft(value)
    setHabitId(id)
    setStage("done")
  }

  switch (stage) {
    case "prompt":
      return (
        <AiHabitPromptStage
          onSubmit={(value) => {
            setTopic(value)
            setStage("review")
          }}
        />
      )
    case "review":
      return (
        <AiHabitReviewStage
          topic={topic}
          onCreate={createHabit}
          onRequestClose={onRequestClose}
        />
      )
    case "done":
      return draft && habitId ? (
        <AiHabitDoneStage
          draft={draft}
          habitId={habitId}
          onStartOver={resetToPrompt}
          onRequestClose={onRequestClose}
        />
      ) : null
  }
}
