import { createFileRoute, redirect } from "@tanstack/react-router"

import { SetupForm } from "@/components/auth/setup-form"
import { userCountQueryOptions } from "@/lib/data/auth"

export const Route = createFileRoute("/_auth/setup")({
  loader: async ({ context }) => {
    const userCount = await context.queryClient.ensureQueryData(
      userCountQueryOptions(),
    )
    if (userCount > 0) {
      throw redirect({ to: "/login" })
    }
  },
  component: SetupPage,
})

function SetupPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Set up Forming
        </h1>
        <p className="text-sm text-muted-foreground">
          No account exists yet. Create the first one to get started.
        </p>
      </div>

      <SetupForm />
    </div>
  )
}
