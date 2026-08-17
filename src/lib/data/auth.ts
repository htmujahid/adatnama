import { queryOptions } from "@tanstack/react-query"

import { getSession } from "@/actions/auth"

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: ["session"],
    queryFn: () => getSession(),
    staleTime: 0,
  })
