import type {
  BrowserCollectionCoordinator,
  BrowserWASQLiteDatabase,
} from "@tanstack/browser-db-sqlite-persistence"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"

const DATABASE_NAME = "adatnama.sqlite"
const COORDINATOR_NAME = "adatnama"

type BrowserDatabase = {
  persistence: PersistedCollectionPersistence
  database: BrowserWASQLiteDatabase
  coordinator: BrowserCollectionCoordinator
}

let databasePromise: Promise<BrowserDatabase> | null = null

async function openBrowserDatabase(): Promise<BrowserDatabase> {
  const {
    BrowserCollectionCoordinator,
    createBrowserWASQLitePersistence,
    openBrowserWASQLiteOPFSDatabase,
  } = await import("@tanstack/browser-db-sqlite-persistence")

  const database = await openBrowserWASQLiteOPFSDatabase({
    databaseName: DATABASE_NAME,
  })
  const coordinator = new BrowserCollectionCoordinator({
    dbName: COORDINATOR_NAME,
  })
  const persistence = createBrowserWASQLitePersistence({
    database,
    coordinator,
  })
  return { persistence, database, coordinator }
}

export function getBrowserPersistence(): Promise<PersistedCollectionPersistence> {
  if (typeof window === "undefined") {
    throw new Error("Browser persistence is only available in the browser.")
  }
  if (!databasePromise) {
    databasePromise = openBrowserDatabase()
  }
  return databasePromise.then(({ persistence }) => persistence)
}

export async function disposeBrowserPersistence() {
  const pending = databasePromise
  databasePromise = null
  if (!pending) return
  const { coordinator, database } = await pending
  coordinator.dispose()
  await database.close?.()
}
