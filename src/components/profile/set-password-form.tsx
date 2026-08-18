import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"

import { setPassword } from "@/actions/auth"
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
import { accountsQueryOptions } from "@/lib/query/auth"

export function SetPasswordForm() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      newPassword: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const { error: setPasswordError } = await setPassword({ data: value })
      if (setPasswordError) {
        setError(setPasswordError.message)
        return
      }

      form.reset()
      await queryClient.invalidateQueries({
        queryKey: accountsQueryOptions().queryKey,
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
        <FieldDescription>
          You signed up with Google, so there's no password on this account yet.
          Set one to also sign in with your username.
        </FieldDescription>

        <form.Field
          name="newPassword"
          validators={{
            onChange: ({ value }) =>
              value.length >= 8
                ? undefined
                : "Password must be at least 8 characters",
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
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

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} className="w-fit">
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Set password
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  )
}
