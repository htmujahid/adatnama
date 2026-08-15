import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router"

import { AppSidebar } from "@/components/layouts/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export const Route = createFileRoute("/home")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login" })
    }
    return { user: context.session.user }
  },
  component: HomeLayout,
})

function toBreadcrumbLabel(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function HomeLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const segments = pathname.split("/").filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  const breadcrumbLabel =
    !lastSegment || lastSegment === "home"
      ? "Home"
      : toBreadcrumbLabel(lastSegment)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 mt-1.5 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 px-4 py-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
