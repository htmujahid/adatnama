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

export const persistence = createBrowserWASQLitePersistence({
  database,
  coordinator,
})
