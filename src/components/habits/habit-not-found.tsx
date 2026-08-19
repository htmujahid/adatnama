import { Link } from "@tanstack/react-router"
import { ListChecksIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function HabitNotFound() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-24 text-center">
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Habit not found
      </h1>
      <p className="text-sm text-muted-foreground">
        This habit doesn't exist or may have been removed.
      </p>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to="/home/habits" />}
      >
        <ListChecksIcon />
        All habits
      </Button>
    </div>
  )
}
