import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import {
  Field,
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
import { authClient } from "@/lib/auth-client"
import { DEFAULT_USERS_SEARCH } from "@/routes/home/users"

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
] as const

export function CreateUserForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      role: "user" as "user" | "admin",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const { error: createError } = await authClient.admin.createUser({
        name: value.username,
        email: `${value.username}@forming.local`,
        password: value.password,
        role: value.role,
        data: {
          username: value.username,
          displayUsername: value.username,
        },
      })
      if (createError) {
        setError(createError.message ?? "Unable to create the user.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["users"] })
      await navigate({ to: "/home/users", search: DEFAULT_USERS_SEARCH })
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
              value.length >= 8
                ? undefined
                : "Password must be at least 8 characters",
          }}
        >
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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

        <form.Field name="role">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  if (value === "user" || value === "admin") {
                    field.handleChange(value)
                  }
                }}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              Create user
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  )
}
