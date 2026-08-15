import { queryOptions } from "@tanstack/react-query"

import {
  getSession,
  getUserById,
  getUserCount,
  listUsers,
} from "@/actions/auth"
import type { ListUsersInput } from "@/actions/auth"

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

export const usersQueryOptions = (params: ListUsersInput) =>
  queryOptions({
    queryKey: ["users", params],
    queryFn: () => listUsers({ data: params }),
  })

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["user", userId],
    queryFn: () => getUserById({ data: userId }),
  })
