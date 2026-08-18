import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch((error: unknown) => {
        console.error("Service worker registration failed", error)
      })
  }, [])

  return null
}
