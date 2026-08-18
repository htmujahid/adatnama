import { Link, useRouter } from "@tanstack/react-router"
import { TriangleAlertIcon, WifiOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useOnlineStatus } from "@/hooks/use-online-status"

export function RouterError({ error }: { error: Error }) {
  const router = useRouter()
  const online = useOnlineStatus()

  if (!online) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <WifiOffIcon className="size-8 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            You&apos;re offline
          </h1>
          <p className="text-sm text-muted-foreground">
            This page hasn&apos;t been loaded before, so it isn&apos;t available
            offline. Reconnect and try again.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.invalidate()}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlertIcon className="size-8 text-destructive" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.invalidate()}>
          Try again
        </Button>
        <Button nativeButton={false} render={<Link to="/" />}>
          Go home
        </Button>
      </div>
    </div>
  )
}
