import { useLiveQuery } from "@tanstack/react-db"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { useHomeUser } from "@/hooks/use-home-user"
import { usePreferencesCollection } from "@/lib/collection/preferences"
import { useOfflineExecutor } from "@/lib/db/offline"
import { notificationsFrom, savePreferences } from "@/lib/preferences"
import type { NotificationPreferences } from "@/lib/preferences"

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

export function NotificationsCard() {
  const user = useHomeUser()
  const preferencesCollection = usePreferencesCollection()
  const executor = useOfflineExecutor()
  const { data: preferenceRows = [] } = useLiveQuery((q) =>
    q.from({ preferences: preferencesCollection }),
  )
  const record = preferenceRows.find((row) => row.userId === user.id)
  const notifications = notificationsFrom(record)

  function setNotificationPreference(
    key: keyof NotificationPreferences,
    value: boolean,
  ) {
    const field = {
      reminders: "remindersEnabled",
      weeklySummary: "weeklySummaryEnabled",
      circleActivity: "circleActivityEnabled",
    } as const
    savePreferences({
      executor,
      collection: preferencesCollection,
      userId: user.id,
      record,
      changes: { [field[key]]: value ? 1 : 0 },
    })
  }

  return (
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
  )
}
