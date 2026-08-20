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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { localTimeToUtc, utcTimeToLocal } from "@/lib/habits"

export type EditHabitFormValues = {
  name: string
  categoryId: string
  description: string
  reminderTime: string
}

export type EditHabitInput = {
  name: string
  categoryId: string
  description: string
  reminderTime: string | null
}

export function EditHabitForm({
  defaultValues,
  submitLabel,
  cancel,
  onSubmit,
}: {
  defaultValues: EditHabitFormValues
  submitLabel: string
  cancel: React.ReactNode
  onSubmit: (input: EditHabitInput) => void | Promise<void>
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
        reminderTime: value.reminderTime
          ? localTimeToUtc(value.reminderTime)
          : null,
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
