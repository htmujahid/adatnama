"use client"

import * as React from "react"
import { formatForDisplay } from "@tanstack/hotkeys"
import { useHotkey } from "@tanstack/react-hotkeys"
import { KeyboardIcon } from "lucide-react"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { getHotkeyReference, HOTKEY_REFERENCE } from "@/lib/hotkeys"
import type { HotkeyGroup } from "@/lib/hotkeys"

const GROUP_ORDER: Array<HotkeyGroup> = ["General", "Actions", "Navigation"]

export function HotkeysSheet() {
  const [open, setOpen] = React.useState(false)

  useHotkey(getHotkeyReference("shortcuts").hotkey!, () => {
    setOpen((prev) => !prev)
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <SheetTrigger render={<SidebarMenuButton size="sm" />}>
          <KeyboardIcon />
          <span>Keyboard shortcuts</span>
        </SheetTrigger>
      </SidebarMenuItem>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Keyboard shortcuts</SheetTitle>
          <SheetDescription>
            Press{" "}
            <Kbd>
              {formatForDisplay(getHotkeyReference("shortcuts").hotkey!)}
            </Kbd>{" "}
            anytime to open this sheet.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
          {GROUP_ORDER.map((group) => {
            const items = HOTKEY_REFERENCE.filter(
              (reference) => reference.group === group,
            )
            if (items.length === 0) {
              return null
            }

            return (
              <div key={group} className="flex flex-col gap-2">
                <h3 className="text-xs font-medium text-muted-foreground uppercase">
                  {group}
                </h3>
                <div className="flex flex-col gap-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-1"
                    >
                      <span className="text-sm text-foreground">
                        {item.description}
                      </span>
                      {item.sequence ? (
                        <KbdGroup>
                          <Kbd>{formatForDisplay(item.sequence[0])}</Kbd>
                          <span className="text-xs text-muted-foreground">
                            then
                          </span>
                          <Kbd>{formatForDisplay(item.sequence[1])}</Kbd>
                        </KbdGroup>
                      ) : (
                        <Kbd>{formatForDisplay(item.hotkey!)}</Kbd>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
