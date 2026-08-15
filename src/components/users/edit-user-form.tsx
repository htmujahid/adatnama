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

import type { User } from "./users-columns"

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
] as const

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
] as const

export function EditUserForm({ user }: { user: User }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      username: user.username ?? user.name,
      role: (user.role ?? "user") as "user" | "admin",
      status: user.banned ? "banned" : "active",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const { error: updateError } = await authClient.admin.updateUser({
        userId: user.id,
        data: {
          name: value.username,
          username: value.username,
          displayUsername: value.username,
        },
      })
      if (updateError) {
        setError(updateError.message ?? "Unable to update the user.")
        return
      }

      const { error: roleError } = await authClient.admin.setRole({
        userId: user.id,
        role: value.role,
      })
      if (roleError) {
        setError(roleError.message ?? "Unable to update the role.")
        return
      }

      const { error: statusError } =
        value.status === "banned"
          ? await authClient.admin.banUser({ userId: user.id })
          : await authClient.admin.unbanUser({ userId: user.id })
      if (statusError) {
        setError(statusError.message ?? "Unable to update the status.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["users"] })
      await queryClient.invalidateQueries({ queryKey: ["user", user.id] })
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

        <form.Field name="status">
          {(field) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Status</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  if (value === "active" || value === "banned") {
                    field.handleChange(value)
                  }
                }}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
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
              Save changes
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  )
}
