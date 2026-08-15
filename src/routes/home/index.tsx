import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/home/")({ component: HomePage })

function HomePage() {
  const { user } = Route.useRouteContext()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome back, {user.name}
      </h1>
      <p className="text-muted-foreground">
        You&apos;re signed in as {user.email}. This page only renders for an
        authenticated session.
      </p>
    </div>
  )
}
