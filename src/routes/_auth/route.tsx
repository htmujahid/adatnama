import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router"

import { OfflineScreen } from "@/components/pwa/offline-screen"
import { useOnlineStatus } from "@/hooks/use-online-status"

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/home" })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const online = useOnlineStatus()
  const router = useRouter()

  if (!online) {
    return (
      <OfflineScreen
        description="Signing in needs a connection. Reconnect to continue — once you're signed in, your habits work fully offline."
        onRetry={() => router.invalidate()}
      />
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
