import { Link } from "@tanstack/react-router"

import { STATUS_LINK } from "@/components/layouts/nav-links"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            A
          </span>
          &copy; {year} Adatnama. All rights reserved.
        </div>

        <nav className="flex items-center gap-4">
          <Link
            to={STATUS_LINK.to}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {STATUS_LINK.label}
          </Link>
        </nav>
      </div>
    </footer>
  )
}
