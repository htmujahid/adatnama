import { useEffect } from "react"

// sw.js is only generated for production builds (see vite.config.ts) — the
// dev server has nothing to register, and there is no need for one there.
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!import.meta.env.PROD) return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker
      // Bypass the HTTP cache when checking sw.js itself for updates, on
      // top of Cloudflare's default no-cache headers for unhashed assets —
      // belt and suspenders so update checks are never served stale.
      .register("/sw.js", { updateViaCache: "none" })
      .catch((error: unknown) => {
        console.error("Service worker registration failed", error)
      })
  }, [])

  return null
}
