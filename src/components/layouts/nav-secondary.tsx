import * as React from "react"
import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function isExternalUrl(url: string) {
  return /^(https?:|mailto:|tel:)/i.test(url)
}

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const external = isExternalUrl(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  size="sm"
                  render={
                    external ? (
                      <a
                        href={item.url}
                        target={
                          item.url.startsWith("mailto:") ? undefined : "_blank"
                        }
                        rel={
                          item.url.startsWith("mailto:")
                            ? undefined
                            : "noreferrer"
                        }
                      />
                    ) : (
                      <Link to={item.url} />
                    )
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
