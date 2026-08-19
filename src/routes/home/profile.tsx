import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { AvatarForm } from "@/components/profile/avatar-form"
import { PasswordForm } from "@/components/profile/password-form"
import { ProfileForm } from "@/components/profile/profile-form"
import { SetPasswordForm } from "@/components/profile/set-password-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { accountsQueryOptions } from "@/lib/query/auth"

export const Route = createFileRoute("/home/profile")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(accountsQueryOptions())
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions())
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarForm user={user} />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          {hasPassword && (
            <CardDescription>
              Enter your current password to set a new one.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {hasPassword ? <PasswordForm /> : <SetPasswordForm />}
        </CardContent>
      </Card>
    </div>
  )
}
