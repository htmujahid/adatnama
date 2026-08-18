import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import {
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  ShieldUserIcon,
  SunIcon,
} from "lucide-react"

import { CategorySelect } from "@/components/categories/category-select"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  setNotificationPreference,
  updateHabitDefaults,
  usePreferences,
} from "@/hooks/use-preferences"
import type { NotificationPreferences } from "@/hooks/use-preferences"
import { useThemeMode } from "@/hooks/use-theme-mode"
import type { ThemeMode } from "@/hooks/use-theme-mode"
import { authClient } from "@/lib/auth-client"
import { sessionQueryOptions } from "@/lib/data/auth"
import { HABIT_FREQUENCIES } from "@/routes/home/-data"

export const Route = createFileRoute("/home/settings")({
  component: SettingsPage,
})

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "auto", label: "System", icon: MonitorIcon },
] as const satisfies ReadonlyArray<{
  value: ThemeMode
  label: string
  icon: typeof SunIcon
}>

const NOTIFICATION_OPTIONS = [
  {
    key: "reminders",
    label: "Habit reminders",
    description: "Get notified when a habit's reminder time hits.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description: "A recap of your streaks and check-ins every Sunday.",
  },
  {
    key: "circleActivity",
    label: "Circle activity",
    description: "When someone in one of your circles checks in.",
  },
] as const satisfies ReadonlyArray<{
  key: keyof NotificationPreferences
  label: string
  description: string
}>

function SettingsPage() {
  const { mode, setMode } = useThemeMode()
  const { habitDefaults, notifications } = usePreferences()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await authClient.signOut()
    queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey })
    await router.invalidate({ sync: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
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

      <Card size="sm">
        <CardHeader>
          <CardTitle>Habit defaults</CardTitle>
          <CardDescription>
            Applied automatically whenever you create a new habit.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="default-category">Category</FieldLabel>
            <CategorySelect
              id="default-category"
              value={habitDefaults.category ?? ""}
              onChange={(value) =>
                updateHabitDefaults({ ...habitDefaults, category: value })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="default-frequency">Frequency</FieldLabel>
            <Select
              value={habitDefaults.frequency}
              onValueChange={(value) =>
                value &&
                updateHabitDefaults({ ...habitDefaults, frequency: value })
              }
            >
              <SelectTrigger id="default-frequency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_FREQUENCIES.map((frequency) => (
                  <SelectItem key={frequency} value={frequency}>
                    {frequency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            data-invalid={
              habitDefaults.freezesTotal < 0 || habitDefaults.freezesTotal > 5
            }
          >
            <FieldLabel htmlFor="default-freezes">Freezes</FieldLabel>
            <Input
              id="default-freezes"
              type="number"
              min={0}
              max={5}
              value={habitDefaults.freezesTotal}
              onChange={(event) =>
                updateHabitDefaults({
                  ...habitDefaults,
                  freezesTotal: Number(event.target.value),
                })
              }
            />
          </Field>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose what Adatnama can notify you about.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {NOTIFICATION_OPTIONS.map((option) => (
            <Field key={option.key} orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor={`pref-${option.key}`}>
                  {option.label}
                </FieldLabel>
                <FieldDescription>{option.description}</FieldDescription>
              </FieldContent>
              <Switch
                id={`pref-${option.key}`}
                checked={notifications[option.key]}
                onCheckedChange={(checked) =>
                  setNotificationPreference(option.key, checked)
                }
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your name, avatar, email, and password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/home/profile" />}
          >
            <ShieldUserIcon />
            Go to profile
          </Button>
        </CardFooter>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            Sign out of Adatnama on this device.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOutIcon />
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
