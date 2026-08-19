if (typeof window === "undefined") {
  throw new Error("src/lib/db/browser.ts is only available in the browser.")
}

const {
  BrowserCollectionCoordinator,
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
} = await import("@tanstack/browser-db-sqlite-persistence")

const DATABASE_NAME = "adatnama.sqlite"

const database = await openBrowserWASQLiteOPFSDatabase({
  databaseName: DATABASE_NAME,
})

const coordinator = new BrowserCollectionCoordinator({
  dbName: "adatnama",
})

export const persistence = createBrowserWASQLitePersistence({
  database,
  coordinator,
})

export async function clearBrowserPersistence(): Promise<void> {
  const { IndexedDBAdapter, LocalStorageAdapter } =
    await import("@tanstack/offline-transactions")
  coordinator.dispose()
  try {
    await database.close?.()
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
