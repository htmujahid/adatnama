import {
  deletePushSubscription,
  getVapidPublicKey,
  savePushSubscription,
} from "@/actions/push"

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(normalized)
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let index = 0; index < raw.length; index++) {
    bytes[index] = raw.charCodeAt(index)
  }
  return bytes
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  )
}

export async function enablePushReminders(): Promise<{
  error: string | null
}> {
  if (!pushSupported()) {
    return { error: "Push notifications aren't supported in this browser." }
  }

  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    return { error: "Notification permission was denied." }
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    return {
      error: "Service worker isn't ready yet. Reload the app and try again.",
    }
  }

  const publicKey = await getVapidPublicKey()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    await subscription.unsubscribe()
    return { error: "Could not read the push subscription." }
  }

  const { error } = await savePushSubscription({
    data: {
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  })
  if (error) {
    return { error: error.message }
  }
  return { error: null }
}

export async function disablePushReminders(): Promise<void> {
  if (!pushSupported()) return
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return
  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  await deletePushSubscription({ data: { endpoint } })
}
