import { Link } from "@tanstack/react-router"

export function BrandMark({ to = "/" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 text-base font-semibold tracking-tight"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        F
      </span>
      Forming
    </Link>
  )
}
