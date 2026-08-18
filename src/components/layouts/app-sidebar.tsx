"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useRouter } from "@tanstack/react-router"
import {
  AwardIcon,
  CalendarCheckIcon,
  FlameIcon,
  LifeBuoy,
  ListChecksIcon,
  Send,
  Settings2Icon,
  TrendingUpIcon,
} from "lucide-react"

import { NavCircles } from "@/components/layouts/nav-circles"
import { NavMain } from "@/components/layouts/nav-main"
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
import { inviteLinkFor, useCircles } from "@/hooks/use-circles"
import { useHomeUser } from "@/hooks/use-home-user"
import { authClient } from "@/lib/auth-client"
import { sessionQueryOptions } from "@/lib/data/auth"

import { NavSecondary } from "./nav-secondary"

const data = {
  navMain: [
    {
      title: "Habits",
      url: "#",
      icon: <ListChecksIcon />,
      isActive: true,
      items: [
        {
          title: "All habits",
          url: "/home/habits",
        },
        {
          title: "Archived",
          url: "/home/habits/archived",
        },
      ],
    },
    {
      title: "Streaks",
      url: "/home/streaks",
      icon: <FlameIcon />,
    },
    {
      title: "Achievements",
      url: "/home/achievements",
      icon: <AwardIcon />,
    },
    {
      title: "Check-ins",
      url: "/home/checkins",
      icon: <CalendarCheckIcon />,
    },
    {
      title: "Insights",
      url: "/home/insights",
      icon: <TrendingUpIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2Icon,
    },
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useHomeUser()
  const router = useRouter()
  const queryClient = useQueryClient()
  const circles = useCircles()
  const circleNavItems = circles.map((circle) => ({
    id: circle.id,
    name: circle.name,
    url: `/home/circles/${circle.id}`,
    color: circle.color,
    inviteLink: inviteLinkFor(circle),
  }))

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
        <NavCircles circles={circleNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
        <NavUser user={user} onSignOut={handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  )
}
