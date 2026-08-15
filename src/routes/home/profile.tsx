import { createFileRoute } from "@tanstack/react-router"

import { PasswordForm } from "@/components/profile/password-form"
import { ProfileForm } from "@/components/profile/profile-form"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/home/profile")({
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useRouteContext()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-lg font-medium">Account</h2>
        <ProfileForm user={user} />
      </section>

      <Separator />

      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-lg font-medium">Password</h2>
        <p className="-mt-4 text-sm text-muted-foreground">
          Enter your current password to set a new one.
        </p>
        <PasswordForm />
      </section>
    </div>
  )
}
