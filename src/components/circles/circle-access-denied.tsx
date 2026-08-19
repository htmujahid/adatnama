import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CircleAccessDenied() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        You don't have access to this circle
      </h1>
      <p className="text-sm text-muted-foreground">
        It may not exist, or you may not be a member. Ask an owner or admin for
        the circle's invite link to join.
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
