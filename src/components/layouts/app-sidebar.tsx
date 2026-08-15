"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useRouter } from "@tanstack/react-router"
import {
  BookOpenIcon,
  BotIcon,
  FrameIcon,
  LifeBuoy,
  MapIcon,
  PieChartIcon,
  Send,
  Settings2Icon,
  TerminalSquareIcon,
} from "lucide-react"

import { NavMain } from "@/components/layouts/nav-main"
import { NavProjects } from "@/components/layouts/nav-projects"
import { NavUser } from "@/components/layouts/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useHomeUser } from "@/hooks/use-home-user"
import { authClient } from "@/lib/auth-client"
import { sessionQueryOptions } from "@/lib/data/auth"
import { NavSecondary } from "./nav-secondary"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
      roles: ["admin", "user"],
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: <BotIcon />,
      roles: ["admin", "user"],
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: <BookOpenIcon />,
      roles: ["admin", "user"],
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: <Settings2Icon />,
      roles: ["admin"],
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
      roles: ["admin", "user"],
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
      roles: ["admin", "user"],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <FrameIcon />,
      roles: ["admin", "user"],
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChartIcon />,
      roles: ["admin", "user"],
    },
    {
      name: "Travel",
      url: "#",
      icon: <MapIcon />,
      roles: ["admin", "user"],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useHomeUser()
  const router = useRouter()
  const queryClient = useQueryClient()

  const role = user.role ?? "user"
  const navMain = data.navMain.filter((item) => item.roles.includes(role))
  const navSecondary = data.navSecondary.filter((item) =>
    item.roles.includes(role),
  )
  const projects = data.projects.filter((item) => item.roles.includes(role))

  const handleSignOut = async () => {
    await authClient.signOut()
    queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey })
    await router.invalidate({ sync: true })
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/home" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
                F
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Forming</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Reactive, local-first forms
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={navSecondary} />
        <NavUser user={user} onSignOut={handleSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
