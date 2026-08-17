import { Link } from "@tanstack/react-router"
import { FlameIcon } from "lucide-react"

export function BrandMark({ to = "/" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-base font-semibold tracking-tight"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <FlameIcon className="size-4" />
      </span>
      Adatnama
    </Link>
  )
}
