import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" })
    }
    return { user: context.session.user }
  },
  component: () => <Outlet />,
})
