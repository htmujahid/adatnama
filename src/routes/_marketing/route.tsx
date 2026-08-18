import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"

export const Route = createFileRoute("/_marketing")({
  beforeLoad: ({ context }) => {
    if (context.session) {
      throw redirect({ to: "/home" })
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
