import { useForm } from "@tanstack/react-form"
import { CheckIcon } from "lucide-react"

import type { CircleInput } from "@/actions/circles"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { PRESET_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"

export type CircleFormValues = {
  name: string
  description: string
  color: string
}

export function CircleForm({
  defaultValues,
  submitLabel,
  cancel,
  error,
  onSubmit,
}: {
  defaultValues: CircleFormValues
  submitLabel: string
  cancel: React.ReactNode
  error?: string | null
  onSubmit: (input: CircleInput) => void | Promise<void>
}) {
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit({
        name: value.name.trim(),
        description: value.description.trim(),
        color: value.color,
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
                placeholder="Family"
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
                placeholder="Keeping each other honest on the everyday stuff."
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

        <form.Field name="color">
          {(field) => (
            <Field>
              <FieldLabel>Color</FieldLabel>
              <ToggleGroup
                value={[field.state.value]}
                onValueChange={(value) => {
                  const next = value[0]
                  if (next) field.handleChange(next)
                }}
              >
                {PRESET_COLORS.map((color) => (
                  <ToggleGroupItem
                    key={color.id}
                    value={color.value}
                    aria-label={color.label}
                    className="relative p-1.5"
                  >
                    <span
                      className="block size-5 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: color.value }}
                    />
                    {field.state.value === color.value && (
                      <CheckIcon
                        className={cn(
                          "absolute inset-0 m-auto size-3 text-white mix-blend-difference",
                        )}
                      />
                    )}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          )}
        </form.Field>

        <FieldError>{error}</FieldError>

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
