import type {
  BrowserCollectionCoordinator as BrowserCollectionCoordinatorType,
  BrowserWASQLiteDatabase,
} from "@tanstack/browser-db-sqlite-persistence"
import type { PersistedCollectionPersistence } from "@tanstack/db-sqlite-persistence-core"

const DATABASE_NAME = "adatnama.sqlite"

let browserDatabase: BrowserWASQLiteDatabase | undefined
let browserCoordinator: BrowserCollectionCoordinatorType | undefined

// Collection factories run during SSR too (routes are imported eagerly), but
// OPFS/wa-sqlite only exist in the browser, so the server gets an inert
// stand-in that never gets read from — real data arrives on hydration.
function createServerPersistenceStub(): PersistedCollectionPersistence {
  return {
    adapter: {
      loadSubset: async () => [],
      applyCommittedTx: async () => {},
      ensureIndex: async () => {},
    },
  }
}

export const persistence: PersistedCollectionPersistence =
  typeof window === "undefined"
    ? createServerPersistenceStub()
    : await (async () => {
        const {
          BrowserCollectionCoordinator,
          createBrowserWASQLitePersistence,
          openBrowserWASQLiteOPFSDatabase,
        } = await import("@tanstack/browser-db-sqlite-persistence")

        browserDatabase = await openBrowserWASQLiteOPFSDatabase({
          databaseName: DATABASE_NAME,
        })
        browserCoordinator = new BrowserCollectionCoordinator({
          dbName: "adatnama",
        })

        return createBrowserWASQLitePersistence({
          database: browserDatabase,
          coordinator: browserCoordinator,
        })
      })()

export async function clearBrowserPersistence(): Promise<void> {
  const { IndexedDBAdapter, LocalStorageAdapter } =
    await import("@tanstack/offline-transactions")
  browserCoordinator?.dispose()
  try {
    await browserDatabase?.close?.()
  } catch {
    // the OPFS worker is terminated even when close fails
  }
  await Promise.all([
    new IndexedDBAdapter().clear(),
    new LocalStorageAdapter().clear(),
  ])
  const root = await navigator.storage.getDirectory()
  const names: Array<string> = []
  for await (const name of root.keys()) {
    if (
      name === DATABASE_NAME ||
      name.startsWith(`${DATABASE_NAME}-`) ||
      name.startsWith(".ahp-")
    ) {
      names.push(name)
    }
  }
  const results = await Promise.allSettled(
    names.map((name) => root.removeEntry(name, { recursive: true })),
  )
  if (results.some((result) => result.status === "rejected")) {
    throw new Error(
      "Some local data files are still in use. Close other Adatnama tabs and try again.",
    )
  }
}
