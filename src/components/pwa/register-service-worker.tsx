import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    // In dev there is no generated sw.js; register the push handlers alone.
    navigator.serviceWorker
      .register(import.meta.env.PROD ? "/sw.js" : "/push-sw.js", {
        updateViaCache: "none",
      })
      .catch((error: unknown) => {
        console.error("Service worker registration failed", error)
      })
  }, [])

  return null
}
