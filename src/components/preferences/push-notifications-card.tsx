import { useEffect, useState } from "react"
import { BellRingIcon } from "lucide-react"

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
  FieldError,
  FieldTitle,
} from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  disablePushReminders,
  enablePushReminders,
  pushSupported,
} from "@/lib/push-client"

type PushStatus = "loading" | "unsupported" | "blocked" | "ready"

export function PushNotificationsCard() {
  const [status, setStatus] = useState<PushStatus>("loading")
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pushSupported()) {
      setStatus("unsupported")
      return
    }
    if (Notification.permission === "denied") {
      setStatus("blocked")
      return
    }
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => {
        setEnabled(subscription != null)
        setStatus("ready")
      })
      .catch(() => setStatus("ready"))
  }, [])

  async function handleToggle(next: boolean) {
    setBusy(true)
    setError(null)
    if (next) {
      const { error: enableError } = await enablePushReminders()
      if (enableError) {
        setError(enableError)
        setStatus(Notification.permission === "denied" ? "blocked" : "ready")
      } else {
        setEnabled(true)
      }
    } else {
      await disablePushReminders()
      setEnabled(false)
    }
    setBusy(false)
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Habit reminders</CardTitle>
        <CardDescription>
          Get a push notification at each habit&apos;s reminder time, even when
          Adatnama isn&apos;t open.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <Skeleton className="h-12 w-full" />
        ) : status === "unsupported" ? (
          <p className="text-sm text-muted-foreground">
            Push notifications aren&apos;t supported in this browser.
          </p>
        ) : (
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>
                <BellRingIcon className="size-4" />
                Push notifications
              </FieldTitle>
              {status === "blocked" && (
                <FieldError>
                  Notifications are blocked for this site. Allow them in your
                  browser&apos;s site settings, then reload this page.
                </FieldError>
              )}
              <FieldError>{error}</FieldError>
            </FieldContent>
            <Switch
              checked={enabled}
              disabled={busy || status === "blocked"}
              onCheckedChange={handleToggle}
            />
          </Field>
        )}
      </CardContent>
    </Card>
  )
}
