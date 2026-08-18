"use client"

import { useState } from "react"
import { Link, useParams } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  Share2Icon,
  UserPlusIcon,
} from "lucide-react"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { circlesCollection } from "@/lib/collection/circles"
import { useOfflineExecutor } from "@/lib/db/offline"

export function NavCircles({
  circles,
}: {
  circles: {
    id: string
    organizationId: string
    name: string
    url: string
    color: string
    inviteLink: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const executor = useOfflineExecutor()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { circleId: activeCircleId } = useParams({ strict: false })

  const handleLeave = (organizationId: string) => {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "circles.leave" })
      .mutate(() => {
        circlesCollection.delete(organizationId)
      })
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Circles</SidebarGroupLabel>
      <SidebarGroupAction
        render={<Link to="/home/circles" title="All circles" />}
      >
        <ArrowRightIcon />
        <span className="sr-only">All circles</span>
      </SidebarGroupAction>
      <SidebarMenu>
        {circles.map((item) => (
          <SidebarMenuItem key={item.organizationId}>
            <SidebarMenuButton
              isActive={item.id === activeCircleId}
              render={<Link to={item.url} />}
            >
              <CircleColorDot color={item.color} />
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <MoreHorizontalIcon />
                <span className="sr-only">More</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-fit"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem render={<Link to={item.url} />}>
                  <UserPlusIcon />
                  <span>Invite members</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void navigator.clipboard.writeText(item.inviteLink)
                    setCopiedId(item.id)
                    setTimeout(() => setCopiedId(null), 1500)
                  }}
                >
                  <Share2Icon />
                  <span>
                    {copiedId === item.id ? "Copied!" : "Share invite link"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleLeave(item.organizationId)}
                >
                  <LogOutIcon />
                  <span>Leave circle</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
