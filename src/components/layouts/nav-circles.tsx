"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  Share2Icon,
  UserPlusIcon,
} from "lucide-react"

import { leaveCircle } from "@/actions/circles"
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
import { circlesQueryOptions } from "@/lib/data/circles"

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
  const queryClient = useQueryClient()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [leaveError, setLeaveError] = useState<{
    id: string
    message: string
  } | null>(null)

  const handleLeave = async (id: string, organizationId: string) => {
    setLeaveError(null)
    const { error } = await leaveCircle({ data: { organizationId } })
    if (error) {
      setLeaveError({ id, message: error.message })
      return
    }
    await queryClient.invalidateQueries({
      queryKey: circlesQueryOptions().queryKey,
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
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton render={<Link to={item.url} />}>
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
                  onClick={() => void handleLeave(item.id, item.organizationId)}
                >
                  <LogOutIcon />
                  <span>Leave circle</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {leaveError?.id === item.id && (
              <p className="px-2 pb-1 text-xs text-destructive">
                {leaveError.message}
              </p>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
