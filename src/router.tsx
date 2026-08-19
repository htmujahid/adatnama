import { DbClient } from "@tanstack/react-db"
import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { routerWithDbClient } from "@tanstack/react-router-with-db"

import { RouterError } from "@/components/router/error"
import { RouterNotFound } from "@/components/router/not-found"
import { RouterPending } from "@/components/router/pending"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
  const dbClient = new DbClient({ queryClient })

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient, dbClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RouterPending,
    defaultErrorComponent: RouterError,
    defaultNotFoundComponent: RouterNotFound,
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return routerWithDbClient(router, dbClient)
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
