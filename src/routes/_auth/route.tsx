import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/home" })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            F
          </span>
          Forming
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
