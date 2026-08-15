import { Link } from "@tanstack/react-router"
import { CompassIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RouterNotFound() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <CompassIcon className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Button nativeButton={false} render={<Link to="/" />}>
        Go home
      </Button>
    </div>
  )
}
