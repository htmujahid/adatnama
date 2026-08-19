import { DbClient } from "@tanstack/db"
import { QueryClient } from "@tanstack/react-query"

if (typeof window === "undefined") {
  throw new Error("src/lib/db/browser.ts is only available in the browser.")
}

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

const collectionsQueryClient = new QueryClient()

export const db = new DbClient({
  queryClient: collectionsQueryClient,
  persistence,
})
