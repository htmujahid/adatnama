import { collectionOptions } from "@tanstack/db"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { useDbClient } from "@tanstack/react-db"
import type { QueryClient } from "@tanstack/react-query"

import { getSession, listAccounts } from "@/actions/auth"

export type SessionRecord = NonNullable<Awaited<ReturnType<typeof getSession>>>

export const sessionCollection = collectionOptions("session", (client) =>
  queryCollectionOptions({
    id: "session",
    queryKey: ["session"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    getKey: (session: SessionRecord) => session.user.id,
    queryFn: async () => {
      const session = await getSession()
      return session ? [session] : []
    },
    staleTime: 0,
    gcTime: Number.POSITIVE_INFINITY,
  }),
)

export function useSessionCollection() {
  return useDbClient().collection(sessionCollection)
}

export type SessionCollection = ReturnType<typeof useSessionCollection>

export type AccountRecord = Awaited<ReturnType<typeof listAccounts>>[number]

export const accountsCollection = collectionOptions("accounts", (client) =>
  queryCollectionOptions({
    id: "accounts",
    queryKey: ["accounts"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    getKey: (account: AccountRecord) => account.id,
    queryFn: () => listAccounts(),
  }),
)

export function useAccountsCollection() {
  return useDbClient().collection(accountsCollection)
}

export type AccountsCollection = ReturnType<typeof useAccountsCollection>
