import { queryOptions } from "@tanstack/react-query"

import { getSession, listAccounts } from "@/actions/auth"

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: () => getSession(),
    staleTime: 0,
    gcTime: Number.POSITIVE_INFINITY,
  })

export const accountsQueryOptions = () =>
  queryOptions({
    queryKey: ["accounts"],
    queryFn: () => listAccounts(),
  })
