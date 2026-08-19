import { DbClient } from "@tanstack/db"
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

const persistence = createBrowserWASQLitePersistence({
  database,
  coordinator,
})

/**
 * Persisted collections never participate in SSR (this module only loads
 * under the ssr:false /home tree), so they get their own QueryClient instead
 * of the router's SSR-integrated one — keeps them off its cache/staleTime
 * defaults, which are tuned for SSR dehydration, not local persistence.
 */
const collectionsQueryClient = new QueryClient()

/**
 * Collection descriptors in src/lib/collection/ resolve these keys via
 * client.requireDependency("queryClient" | "persistence").
 */
export const db = new DbClient({
  queryClient: collectionsQueryClient,
  persistence,
})
