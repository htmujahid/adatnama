"use client"

import { useHotkeys, useHotkeySequences } from "@tanstack/react-hotkeys"
import { useNavigate } from "@tanstack/react-router"

import { useThemeMode } from "@/hooks/use-theme-mode"
import type { ThemeMode } from "@/hooks/use-theme-mode"
import { getHotkeyReference } from "@/lib/hotkeys"

const THEME_CYCLE: Array<ThemeMode> = ["light", "dark", "auto"]

const NAV_TARGETS: Record<string, string> = {
  "nav-home": "/home",
  "nav-habits": "/home/habits",
  "nav-categories": "/home/categories",
  "nav-archived": "/home/habits/archived",
  "nav-streaks": "/home/streaks",
  "nav-achievements": "/home/achievements",
  "nav-checkins": "/home/checkins",
  "nav-insights": "/home/insights",
  "nav-circles": "/home/circles",
  "nav-preferences": "/home/preferences",
  "nav-profile": "/home/profile",
}

export function AppHotkeys() {
  const navigate = useNavigate()
  const { mode, setMode } = useThemeMode()

  useHotkeySequences(
    Object.entries(NAV_TARGETS).map(([id, to]) => ({
      sequence: getHotkeyReference(id).sequence!,
      callback: () => navigate({ to }),
    })),
  )

  useHotkeys([
    {
      hotkey: getHotkeyReference("new-habit").hotkey!,
      callback: () => navigate({ to: "/home/habits/new" }),
    },
    {
      hotkey: getHotkeyReference("new-circle").hotkey!,
      callback: () => navigate({ to: "/home/circles/new" }),
    },
    {
      hotkey: getHotkeyReference("toggle-theme").hotkey!,
      callback: () => {
        const next =
          THEME_CYCLE[(THEME_CYCLE.indexOf(mode) + 1) % THEME_CYCLE.length]
        setMode(next)
      },
    },
  ])

  return null
}
