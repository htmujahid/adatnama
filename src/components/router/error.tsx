import { Link, useRouter } from "@tanstack/react-router"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RouterError({ error }: { error: Error }) {
  const router = useRouter()

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
