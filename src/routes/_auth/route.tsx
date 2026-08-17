import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

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
        <Outlet />
      </div>
    </div>
  )
}
