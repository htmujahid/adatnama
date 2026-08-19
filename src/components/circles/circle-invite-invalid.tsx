import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CircleInviteInvalid() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-24 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Invalid invite link
      </h1>
      <p className="text-sm text-muted-foreground">
        This invite code doesn't match any circle. It may have been regenerated.
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
