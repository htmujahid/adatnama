import { useForm } from "@tanstack/react-form"

import { CategorySelect } from "@/components/categories/category-select"
import { Button } from "@/components/ui/button"
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
import type { HabitInput } from "@/hooks/use-habit-catalog"
import { HABIT_FREQUENCIES } from "@/routes/home/-data"

export type HabitFormValues = {
  name: string
  category: string
  description: string
  target: string
  frequency: string
  reminderTime: string
  freezesTotal: number
}

export function reminderTimeToInputValue(reminderTime: string | null) {
  if (!reminderTime) return ""
  const match = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i.exec(reminderTime)
  if (!match) return ""
  let hours = Number(match[1]) % 12
  if (match[3].toUpperCase() === "PM") hours += 12
  return `${String(hours).padStart(2, "0")}:${match[2]}`
}

function inputValueToReminderTime(value: string): string | null {
  if (!value) return null
  const [hoursText, minutes] = value.split(":")
  const hours24 = Number(hoursText)
  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${minutes} ${period}`
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
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name.trim(),
        category: value.category,
        description: value.description.trim(),
        target: value.target.trim(),
        frequency: value.frequency,
        reminderTime: inputValueToReminderTime(value.reminderTime),
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

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="category"
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

          <form.Field name="frequency">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Frequency</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => value && field.handleChange(value)}
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HABIT_FREQUENCIES.map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {frequency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </form.Field>
        </div>

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
