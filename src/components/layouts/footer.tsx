import { Link } from "@tanstack/react-router"
import { FlameIcon } from "lucide-react"

import { STATUS_LINK } from "@/components/layouts/nav-links"

const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { to: "/features", label: "Features" },
      { to: STATUS_LINK.to, label: STATUS_LINK.label },
    ],
  },
  {
    title: "Company",
    links: [{ to: "/about", label: "About" }],
  },
] as const

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 py-14 sm:flex-row">
          <div className="flex max-w-xs flex-col gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-base font-semibold tracking-tight"
            >
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FlameIcon className="size-4" />
              </span>
              Adatnama
            </Link>
            <p className="text-sm text-pretty text-muted-foreground">
              A daily habit and streak tracker with freezes for bad days,
              schedules that fit real life, and circles for the friends keeping
              you honest.
            </p>
          </div>

          <div className="flex gap-16 sm:gap-24">
            {FOOTER_GROUPS.map((group) => (
              <nav key={group.title} className="flex flex-col gap-3">
                <p className="text-sm font-medium">{group.title}</p>
                {group.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {year} Adatnama. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">One day at a time.</p>
        </div>
      </div>
    </footer>
  )
}
