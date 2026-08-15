import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useThemeMode } from "@/hooks/use-theme-mode"
import type { ThemeMode } from "@/hooks/use-theme-mode"

const modeIcon: Record<ThemeMode, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  auto: MonitorIcon,
}

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode()

  function toggleMode() {
    const nextMode: ThemeMode =
      mode === "light" ? "dark" : mode === "dark" ? "auto" : "light"
    setMode(nextMode)
  }

  const label =
    mode === "auto"
      ? "Theme: auto (system). Click to switch to light mode."
      : `Theme: ${mode}. Click to switch mode.`

  const Icon = modeIcon[mode]

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggleMode}
    >
      <Icon />
    </Button>
  )
}
