import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { useThemeMode } from "@/hooks/use-theme-mode"
import type { ThemeMode } from "@/hooks/use-theme-mode"

const modeIcon: Record<ThemeMode, typeof SunIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  auto: MonitorIcon,
}

export function ThemeMenu() {
  const { mode, setMode } = useThemeMode()
  const Icon = modeIcon[mode]

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => setMode(value as ThemeMode)}
        >
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
