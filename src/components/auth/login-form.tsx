import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"

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

export function LoginForm() {
  const router = useRouter()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const { error: signInError } = await authClient.signIn.username(value)
      if (signInError) {
        setError(signInError.message ?? "Unable to sign in.")
        return
      }
      queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey })
      await router.invalidate({ sync: true })
      await navigate({ to: "/home" })
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

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value ? undefined : "Password is required",
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
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
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Sign in
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  )
}
