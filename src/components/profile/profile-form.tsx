import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { sessionQueryOptions } from "@/lib/data/auth"

export function ProfileForm({
  user,
}: {
  user: { name: string; username?: string | null; email: string }
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    defaultValues: {
      name: user.name,
      username: user.username ?? "",
    },
    onSubmit: async ({ value }) => {
      setError(null)
      setSuccess(false)

      const { error: updateError } = await authClient.updateUser(value)
      if (updateError) {
        setError(updateError.message ?? "Unable to update your profile.")
        return
      }

      const newEmail = `${value.username}@adatnama.local`
      if (newEmail !== user.email) {
        const { error: emailError } = await authClient.changeEmail({
          newEmail,
        })
        if (emailError) {
          setError(emailError.message ?? "Unable to update your email.")
          return
        }
      }

      queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey })
      await router.invalidate({ sync: true })
      setSuccess(true)
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
            onChange: ({ value }) => (value ? undefined : "Name is required"),
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
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
          name="username"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : "Username is required",
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="text"
                autoComplete="username"
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

        <FieldError>{error}</FieldError>

        <div className="flex items-center gap-3">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                Save changes
              </Button>
            )}
          </form.Subscribe>

          {success && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckIcon className="size-4 text-primary" />
              Saved
            </span>
          )}
        </div>
      </FieldGroup>
    </form>
  )
}
