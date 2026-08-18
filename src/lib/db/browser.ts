import { QueryClient } from "@tanstack/react-query"

if (typeof window === "undefined") {
  throw new Error("src/lib/db/browser.ts is only available in the browser.")
}

// Dynamic import keeps wa-sqlite out of the server bundle — a static import
// here previously crashed the Workers runtime with "module is not defined".
const {
  BrowserCollectionCoordinator,
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
} = await import("@tanstack/browser-db-sqlite-persistence")

const database = await openBrowserWASQLiteOPFSDatabase({
  databaseName: "adatnama.sqlite",
})

const coordinator = new BrowserCollectionCoordinator({
  dbName: "adatnama",
})

export const persistence = createBrowserWASQLitePersistence({
  database,
  coordinator,
})

/**
 * Persisted collections never participate in SSR (this module only loads
 * under the ssr:false /home tree), so they get their own QueryClient instead
 * of the router's SSR-integrated one — keeps them off its cache/staleTime
 * defaults, which are tuned for SSR dehydration, not local persistence.
 */
export const collectionsQueryClient = new QueryClient()
