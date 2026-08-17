"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useRouter } from "@tanstack/react-router"
import {
  BookOpenIcon,
  BotIcon,
  FlameIcon,
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
} from "@/components/ui/sidebar"
import { useHomeUser } from "@/hooks/use-home-user"
import { authClient } from "@/lib/auth-client"
import { sessionQueryOptions } from "@/lib/data/auth"

import { NavSecondary } from "./nav-secondary"

const data = {
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: <TerminalSquareIcon />,
      isActive: true,
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
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: <FrameIcon />,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: <PieChartIcon />,
    },
    {
      name: "Travel",
      url: "#",
      icon: <MapIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useHomeUser()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await authClient.signOut()
    queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey })
    await router.invalidate({ sync: true })
  }

  return (
    <Sidebar collapsible="offcanvas" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/home" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FlameIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Adatnama</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Streak & habit tracker
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
        <NavUser user={user} onSignOut={handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  )
}
