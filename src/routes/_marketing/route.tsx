import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"

export const Route = createFileRoute("/_marketing")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/home" })
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      throw redirect({ to: "/login" })
    }
  },
  component: MarketingLayout,
})

function MarketingLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
