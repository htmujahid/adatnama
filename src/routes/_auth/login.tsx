import { createFileRoute, Link } from "@tanstack/react-router"

import { LoginForm } from "@/components/auth/login-form"

export const Route = createFileRoute("/_auth/login")({ component: LoginPage })

function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Link
          to="/"
          className="flex flex-col items-center gap-2 font-medium"
        >
          <div
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
          >
            A
          </div>
          <span className="sr-only">Adatnama</span>
        </Link>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Sign in to your Adatnama account.
        </p>
      </div>

      <LoginForm />
    </div>
  )
}
