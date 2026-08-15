import { createFileRoute } from "@tanstack/react-router"

import { PasswordForm } from "@/components/profile/password-form"
import { ProfileForm } from "@/components/profile/profile-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/home/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
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
          <CardDescription>
            Enter your current password to set a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
