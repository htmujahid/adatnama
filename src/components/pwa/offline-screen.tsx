import { WifiOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function OfflineScreen({
  title = "You're offline",
  description = "Adatnama needs a connection for this page. Your habits and check-ins keep working offline from the home screen.",
  onRetry,
  actions,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  actions?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOffIcon className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
        {actions}
      </div>
    </div>
  )
}
