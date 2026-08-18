import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import type { Plugin } from "vite"

// vite-plugin-pwa (and serwist's Vite plugin, which is derived from it) does
// not run its build step under Vite's multi-environment build — its
// closeBundle hook silently never fires for a TanStack Start production
// build, so `sw.js` is never written (see
// https://github.com/TanStack/router/issues/4988). We call workbox-build's
// generateSW directly instead, from our own closeBundle hook scoped to the
// "client" environment (Vite's built-in name for the browser build; "ssr" is
// the other one, see the `cloudflare()` plugin above) — this only depends on
// workbox-build's stable Node API, not on any Vite-integration layer.
function pwaServiceWorker(): Plugin {
  return {
    name: "pwa-service-worker",
    apply: "build",
    async closeBundle() {
      if (this.environment.name !== "client") return

      const { generateSW } = await import("workbox-build")
      const { count, size, warnings } = await generateSW({
        globDirectory: "dist/client",
        globPatterns: ["**/*.{js,css,woff2,png,svg,ico,webmanifest}"],
        swDest: "dist/client/sw.js",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // No navigateFallback: every route is server-rendered per-session
        // (some behind auth), so a cached HTML shell would be actively
        // wrong. Navigations and all /api / server-fn requests are left
        // completely unhandled by the service worker and always hit the
        // network — only the precached static assets below are served
        // from cache.
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
      })
      if (warnings.length > 0) {
        console.warn("[pwa] generateSW warnings:\n" + warnings.join("\n"))
      }
      console.log(
        `[pwa] sw.js generated — ${count} files precached (${(size / 1024).toFixed(0)} KiB)`,
      )
    },
  }
}

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    pwaServiceWorker(),
  ],
})

export default config
