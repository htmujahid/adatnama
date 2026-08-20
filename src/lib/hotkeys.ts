import type { Hotkey, RegisterableHotkey } from "@tanstack/hotkeys"

export type HotkeyGroup = "General" | "Actions" | "Navigation"

export interface HotkeyReference {
  id: string
  description: string
  group: HotkeyGroup
  hotkey?: RegisterableHotkey
  sequence?: [Hotkey, Hotkey]
}

export const HOTKEY_REFERENCE: Array<HotkeyReference> = [
  {
    id: "command-menu",
    group: "General",
    description: "Open command menu / search",
    hotkey: "Mod+K",
  },
  {
    id: "shortcuts",
    group: "General",
    description: "Show keyboard shortcuts",
    hotkey: { key: "?", shift: true },
  },
  {
    id: "new-habit",
    group: "Actions",
    description: "Create a new habit",
    hotkey: "N",
  },
  {
    id: "new-circle",
    group: "Actions",
    description: "Create a new circle",
    hotkey: "Shift+N",
  },
  {
    id: "toggle-theme",
    group: "Actions",
    description: "Cycle theme (light / dark / system)",
    hotkey: "T",
  },
  {
    id: "nav-home",
    group: "Navigation",
    description: "Go to Home",
    sequence: ["G", "H"],
  },
  {
    id: "nav-habits",
    group: "Navigation",
    description: "Go to all habits",
    sequence: ["G", "A"],
  },
  {
    id: "nav-categories",
    group: "Navigation",
    description: "Go to categories",
    sequence: ["G", "C"],
  },
  {
    id: "nav-archived",
    group: "Navigation",
    description: "Go to archived habits",
    sequence: ["G", "R"],
  },
  {
    id: "nav-streaks",
    group: "Navigation",
    description: "Go to streaks",
    sequence: ["G", "S"],
  },
  {
    id: "nav-achievements",
    group: "Navigation",
    description: "Go to achievements",
    sequence: ["G", "V"],
  },
  {
    id: "nav-checkins",
    group: "Navigation",
    description: "Go to check-ins",
    sequence: ["G", "K"],
  },
  {
    id: "nav-insights",
    group: "Navigation",
    description: "Go to insights",
    sequence: ["G", "I"],
  },
  {
    id: "nav-circles",
    group: "Navigation",
    description: "Go to circles",
    sequence: ["G", "O"],
  },
  {
    id: "nav-preferences",
    group: "Navigation",
    description: "Go to preferences",
    sequence: ["G", "P"],
  },
  {
    id: "nav-profile",
    group: "Navigation",
    description: "Go to profile",
    sequence: ["G", "U"],
  },
]

export function getHotkeyReference(id: string): HotkeyReference {
  const entry = HOTKEY_REFERENCE.find((reference) => reference.id === id)
  if (!entry) {
    throw new Error(`Unknown hotkey reference: ${id}`)
  }
  return entry
}
