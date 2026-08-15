import { useQueryClient } from "@tanstack/react-query"
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router"

import { BrandMark } from "@/components/layouts/brand-mark"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { sessionQueryOptions } from "@/lib/data/auth"

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" })
    }
    return { user: context.session.user }
  },
  component: HomeLayout,
})

const HOME_NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/home/profile", label: "Profile" },
] as const

function HomeLayout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandMark to="/home" />

          <nav className="flex items-center gap-6">
            {HOME_NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/home" }}
                activeProps={{ className: "text-foreground" }}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await authClient.signOut()
              queryClient.removeQueries({
                queryKey: sessionQueryOptions().queryKey,
              })
              await router.invalidate({ sync: true })
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
