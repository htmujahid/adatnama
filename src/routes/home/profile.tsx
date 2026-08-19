import { createFileRoute } from "@tanstack/react-router"

import { AccountCard } from "@/components/profile/account-card"
import { PasswordCard } from "@/components/profile/password-card"
import { ProfilePictureCard } from "@/components/profile/profile-picture-card"
import { accountsQueryOptions } from "@/lib/query/auth"

export const Route = createFileRoute("/home/profile")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(accountsQueryOptions())
  },
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <ProfilePictureCard />
      <AccountCard />
      <PasswordCard />
    </div>
  )
}
