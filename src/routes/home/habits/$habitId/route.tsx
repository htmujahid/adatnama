import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/home/habits/$habitId")({
  component: () => <Outlet />,
})
