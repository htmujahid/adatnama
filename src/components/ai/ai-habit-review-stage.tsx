"use client"

import * as React from "react"

import { suggestHabitPlan } from "@/actions/ai"
import type { HabitPlan } from "@/actions/ai"
import { HabitReviewForm } from "@/components/ai/ai-habit-review-form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Spinner } from "@/components/ui/spinner"
import type { HabitDraft } from "@/lib/ai/habit-suggestions"

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; plan: HabitPlan }

export function AiHabitReviewStage({
  topic,
  onCreate,
  onRequestClose,
}: {
  topic: string
  onCreate: (draft: HabitDraft) => void
  onRequestClose: () => void
}) {
  const [state, setState] = React.useState<FetchState>({ status: "loading" })

  const load = React.useCallback(() => {
    setState({ status: "loading" })
    suggestHabitPlan({ data: { topic } })
      .then((result) => {
        if (result.error || !result.plan) {
          setState({
            status: "error",
            message: result.error?.message ?? "Something went wrong.",
          })
          return
        }
        setState({ status: "ready", plan: result.plan })
      })
      .catch(() => {
        setState({
          status: "error",
          message: "Couldn't reach the assistant. Check your connection.",
        })
      })
  }, [topic])

  React.useEffect(() => {
    load()
  }, [load])

  if (state.status === "loading") {
    return (
      <>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Thinking…</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Shaping "{topic}" into a habit.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
          <Spinner />
          Coming up with a plan…
        </ResponsiveDialogBody>
      </>
    )
  }

  if (state.status === "error") {
    return (
      <>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Couldn't build a plan</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Something went wrong asking the assistant.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter className="max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ResponsiveDialogClose
            render={<Button type="button" variant="outline" />}
          >
            Cancel
          </ResponsiveDialogClose>
          <Button type="button" onClick={load}>
            Try again
          </Button>
        </ResponsiveDialogFooter>
      </>
    )
  }

  return (
    <HabitReviewForm
      plan={state.plan}
      onCreate={onCreate}
      onRequestClose={onRequestClose}
    />
  )
}
