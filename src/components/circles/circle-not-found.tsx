import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CircleNotFound() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-24 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Circle not found
      </h1>
      <p className="text-sm text-muted-foreground">
        This circle doesn't exist or may have been removed.
      </p>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to="/home/circles" />}
      >
        <UsersIcon />
        All circles
      </Button>
    </div>
  )
}
