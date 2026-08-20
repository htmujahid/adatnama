"use client"

import { useLiveQuery } from "@tanstack/react-db"
import { useForm } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"

import type { HabitPlan } from "@/actions/ai"
import { CategorySelect } from "@/components/categories/category-select"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  ResponsiveDialogBody,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useHomeUser } from "@/hooks/use-home-user"
import { useIsMobile } from "@/hooks/use-mobile"
import type { HabitDraft } from "@/lib/ai/habit-suggestions"
import { useCategoriesCollection } from "@/lib/collection/categories"
import { usePreferencesCollection } from "@/lib/collection/preferences"
import { HABIT_DAY_PRESETS } from "@/lib/habits"
import { habitDefaultsFrom } from "@/lib/preferences"
import { cn } from "@/lib/utils"

export function HabitReviewForm({
  plan,
  onCreate,
  onRequestClose,
}: {
  plan: HabitPlan
  onCreate: (draft: HabitDraft) => void
  onRequestClose: () => void
}) {
  const user = useHomeUser()
  const preferencesCollection = usePreferencesCollection()
  const { data: preferenceRows = [], isLoading } = useLiveQuery({
    query: (q) => q.from({ preferences: preferencesCollection }),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  const freezesDefault = habitDefaultsFrom(
    preferenceRows.find((row) => row.userId === user.id),
  ).freezesTotal

  return (
    <HabitPlanForm
      plan={plan}
      freezesDefault={freezesDefault}
      onCreate={onCreate}
      onRequestClose={onRequestClose}
    />
  )
}

function HabitPlanForm({
  plan,
  freezesDefault,
  onCreate,
  onRequestClose,
}: {
  plan: HabitPlan
  freezesDefault: number
  onCreate: (draft: HabitDraft) => void
  onRequestClose: () => void
}) {
  const isMobile = useIsMobile()
  const categoriesCollection = useCategoriesCollection()
  const { data: categories = [] } = useLiveQuery({
    query: (q) => q.from({ category: categoriesCollection }),
  })

  const form = useForm({
    defaultValues: {
      title: plan.title,
      description: plan.description,
      target: plan.target,
      schedule: plan.schedule,
      categoryId: "",
      freezesTotal: freezesDefault,
    },
    onSubmit: async ({ value }) => {
      onCreate({
        title: value.title.trim(),
        description: value.description.trim(),
        target: value.target.trim(),
        schedule: value.schedule,
        categoryId: value.categoryId || null,
        categoryName:
          categories.find((category) => category.id === value.categoryId)
            ?.name ?? "Uncategorized",
        freezesTotal: value.freezesTotal,
      })
    },
  })

  return (
    <form
      className={cn("flex flex-col", isMobile ? "min-h-0 flex-1" : "gap-6")}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>Ready to add it?</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          Review the plan, tweak anything, then create it.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>
      <ResponsiveDialogBody>
        <FieldGroup>
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "Name is required",
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError
                  errors={field.state.meta.errors.map((fieldError) => ({
                    message: String(fieldError),
                  }))}
                />
              </Field>
            )}
          </form.Field>

          <form.Field
            name="description"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "Description is required",
            }}
          >
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError
                  errors={field.state.meta.errors.map((fieldError) => ({
                    message: String(fieldError),
                  }))}
                />
              </Field>
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field
              name="target"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : "Target is required",
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>Target</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder="5 km, 20 pages, 10 minutes..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldError
                    errors={field.state.meta.errors.map((fieldError) => ({
                      message: String(fieldError),
                    }))}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="categoryId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                  <CategorySelect
                    id={field.name}
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="schedule">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Frequency</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value) field.handleChange(value)
                    }}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue>
                        {(selected: string | null) =>
                          HABIT_DAY_PRESETS.find((p) => p.id === selected)
                            ?.label ?? "Select frequency"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {HABIT_DAY_PRESETS.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field
              name="freezesTotal"
              validators={{
                onChange: ({ value }) =>
                  value >= 0 && value <= 5
                    ? undefined
                    : "Must be between 0 and 5",
              }}
            >
              {(field) => (
                <Field data-invalid={field.state.meta.errors.length > 0}>
                  <FieldLabel htmlFor={field.name}>
                    Freezes available
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    min={0}
                    max={5}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                  />
                  <FieldError
                    errors={field.state.meta.errors.map((fieldError) => ({
                      message: String(fieldError),
                    }))}
                  />
                </Field>
              )}
            </form.Field>
          </div>
        </FieldGroup>
      </ResponsiveDialogBody>

      <ResponsiveDialogFooter className="max-md:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="outline"
          nativeButton={false}
          render={<Link to="/home/habits/new" onClick={onRequestClose} />}
        >
          Refine manually
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit]) => (
            <Button type="submit" disabled={!canSubmit}>
              Create habit
            </Button>
          )}
        </form.Subscribe>
      </ResponsiveDialogFooter>
    </form>
  )
}
