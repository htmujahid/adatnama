import { fileURLToPath } from "node:url"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import type { Plugin } from "vite"

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
        importScripts: ["push-sw.js"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 40, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
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
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
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
