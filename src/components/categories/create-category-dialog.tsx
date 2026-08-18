import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { CategoryInput, CategoryRecord } from "@/lib/data/habit"
import { PRESET_COLORS } from "@/lib/colors"
import { cn } from "@/lib/utils"

export function CreateCategoryDialog({
  open,
  onOpenChange,
  category,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryRecord
  onSaved: (input: CategoryInput) => void
}) {
  const isEditing = !!category

  const form = useForm({
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? PRESET_COLORS[0].value,
    },
    onSubmit: async ({ value }) => {
      onSaved({ name: value.name.trim(), color: value.color })
      onOpenChange(false)
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        color: category?.color ?? PRESET_COLORS[0].value,
      })
    }
  }, [open, category?.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit category" : "New category"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Rename or recolor this category."
                : "Categories are yours — create the ones that fit how you track habits."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="mt-4">
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
                    autoFocus
                    placeholder="Fitness"
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
                        {field.state.value === color.value && <CheckMark />}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {isEditing ? "Save changes" : "Create category"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CheckMark() {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 m-auto flex size-5 items-center justify-center text-white mix-blend-difference",
      )}
    >
      <CheckIcon className="size-3" />
    </span>
  )
}
