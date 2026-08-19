import { useForm } from "@tanstack/react-form"

import { CategorySelect } from "@/components/categories/category-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { HabitInput } from "@/lib/collection/habits"
import {
  HABIT_DAY_PRESETS,
  localTimeToUtc,
  schedulePresetFor,
  utcTimeToLocal,
  WEEKDAYS,
} from "@/lib/habits"

export type HabitFormValues = {
  name: string
  categoryId: string
  description: string
  target: string
  days: ReadonlyArray<number>
  reminderTime: string
  freezesTotal: number
}

function scheduleTemplateFor(days: ReadonlyArray<number>): string {
  return schedulePresetFor(days) ?? "custom"
}

export function HabitForm({
  defaultValues,
  submitLabel,
  cancel,
  onSubmit,
}: {
  defaultValues: HabitFormValues
  submitLabel: string
  cancel: React.ReactNode
  onSubmit: (input: HabitInput) => void | Promise<void>
}) {
  const form = useForm({
    defaultValues: {
      ...defaultValues,
      // Stored reminderTime is UTC; the <input type="time"> shows local.
      reminderTime: defaultValues.reminderTime
        ? utcTimeToLocal(defaultValues.reminderTime)
        : "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name.trim(),
        categoryId: value.categoryId,
        description: value.description.trim(),
        target: value.target.trim(),
        days: value.days,
        reminderTime: value.reminderTime
          ? localTimeToUtc(value.reminderTime)
          : null,
        freezesTotal: value.freezesTotal,
      })
    },
  })

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="name"
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
                placeholder="Morning run"
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
                placeholder="Start the day with an easy-paced run around the block."
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
          name="categoryId"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : "Category is required",
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Category</FieldLabel>
              <CategorySelect
                id={field.name}
                value={field.state.value}
                onChange={field.handleChange}
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
          name="days"
          validators={{
            onChange: ({ value }) =>
              value.length > 0 ? undefined : "Select at least one day",
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel>Schedule</FieldLabel>
              <Select
                value={scheduleTemplateFor(field.state.value)}
                onValueChange={(value) => {
                  const preset = HABIT_DAY_PRESETS.find((p) => p.id === value)
                  if (preset) field.handleChange(preset.days)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_DAY_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" disabled>
                    Custom
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-3">
                {WEEKDAYS.map((weekday) => (
                  <label
                    key={weekday.value}
                    className="flex flex-col items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <Checkbox
                      checked={field.state.value.includes(weekday.value)}
                      onCheckedChange={(checked) => {
                        field.handleChange(
                          checked === true
                            ? [...field.state.value, weekday.value].sort(
                                (a, b) => a - b,
                              )
                            : field.state.value.filter(
                                (day) => day !== weekday.value,
                              ),
                        )
                      }}
                      aria-label={weekday.label}
                    />
                    {weekday.short}
                  </label>
                ))}
              </div>
              <FieldError
                errors={field.state.meta.errors.map((fieldError) => ({
                  message: String(fieldError),
                }))}
              />
            </Field>
          )}
        </form.Field>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="reminderTime">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Reminder</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="time"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldDescription>
                  Leave blank for no reminder.
                </FieldDescription>
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
                <FieldLabel htmlFor={field.name}>Freezes available</FieldLabel>
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

        <div className="flex items-center gap-2">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {submitLabel}
              </Button>
            )}
          </form.Subscribe>
          {cancel}
        </div>
      </FieldGroup>
    </form>
  )
}
