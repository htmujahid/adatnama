import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/home/circles/$circleId")({
  component: () => <Outlet />,
})
