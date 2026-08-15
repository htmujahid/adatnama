import { queryOptions } from "@tanstack/react-query"

import { getSession, getUserCount } from "@/actions/auth"

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: () => getSession(),
    staleTime: 0,
  })

export const userCountQueryOptions = () =>
  queryOptions({
    queryKey: ["user-count"],
    queryFn: () => getUserCount(),
  })
