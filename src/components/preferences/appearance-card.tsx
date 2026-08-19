import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useThemeMode } from "@/hooks/use-theme-mode"
import type { ThemeMode } from "@/hooks/use-theme-mode"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "auto", label: "System", icon: MonitorIcon },
] as const satisfies ReadonlyArray<{
  value: ThemeMode
  label: string
  icon: typeof SunIcon
}>

export function AppearanceCard() {
  const { mode, setMode } = useThemeMode()

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Choose how Adatnama looks on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={mode}
          onValueChange={(value) => setMode(value as ThemeMode)}
          className="grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {THEME_OPTIONS.map((option) => (
            <FieldLabel key={option.value} htmlFor={`theme-${option.value}`}>
              <Field orientation="horizontal">
                <RadioGroupItem
                  id={`theme-${option.value}`}
                  value={option.value}
                />
                <option.icon className="size-4" />
                {option.label}
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}
