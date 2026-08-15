import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/home/")({ component: HomePage })

function HomePage() {
  const navigate = useNavigate()
  const { user } = Route.useRouteContext()

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: "/" })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-muted-foreground">
          You&apos;re signed in as {user.email}. This page only renders for an
          authenticated session.
        </p>
      </div>
      <Button variant="outline" className="w-fit" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  )
}
