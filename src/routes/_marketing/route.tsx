import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Footer } from "@/components/layouts/footer"
import { Header } from "@/components/layouts/header"

export const Route = createFileRoute("/_marketing")({
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
