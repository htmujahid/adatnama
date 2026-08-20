"use client"

import * as React from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import {
  AwardIcon,
  CalendarCheckIcon,
  FlameIcon,
  LifeBuoy,
  ListChecksIcon,
  Settings2Icon,
  TrendingUpIcon,
} from "lucide-react"

import {
  NavCircles,
  NavCirclesSkeleton,
} from "@/components/layouts/nav-circles"
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
import { useHomeUser } from "@/hooks/use-home-user"
import { authClient } from "@/lib/auth-client"
import { circlesCollection } from "@/lib/collection/circles"
import { useRefreshSession } from "@/lib/mutations/auth"

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
          title: "Categories",
          url: "/home/categories",
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
      title: "Preferences",
      url: "/home/preferences",
      icon: Settings2Icon,
    },
    {
      title: "Support",
      url: "mailto:htmujahid@gmail.com",
      icon: LifeBuoy,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useHomeUser()
  const refreshSession = useRefreshSession()
  const { data: circles = [], isLoading: circlesLoading } = useLiveQuery({
    query: (q) => q.from({ circle: circlesCollection }),
  })
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const circleNavItems = circles.map((circle) => ({
    id: circle.slug,
    organizationId: circle.id,
    name: circle.name,
    url: `/home/circles/${circle.slug}`,
    color: circle.color,
    inviteLink: `${origin}/home/circles/join/${circle.joinCode}`,
  }))

  const handleSignOut = async () => {
    await authClient.signOut()
    await refreshSession()
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
        {circlesLoading ? (
          <NavCirclesSkeleton />
        ) : (
          <NavCircles circles={circleNavItems} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.navSecondary} />
        <NavUser user={user} onSignOut={handleSignOut} />
      </SidebarFooter>
    </Sidebar>
  )
}
