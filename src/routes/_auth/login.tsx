import { createFileRoute } from "@tanstack/react-router"

import { LoginForm } from "@/components/auth/login-form"

export const Route = createFileRoute("/_auth/login")({ component: LoginPage })

function LoginPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
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
