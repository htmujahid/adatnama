import { createFileRoute, redirect } from "@tanstack/react-router"

import type { Filter } from "@/components/reui/filters"
import { UsersDataGrid } from "@/components/users/users-data-grid"
import { usersQueryOptions } from "@/lib/data/auth"

const PAGE_SIZES = [5, 10, 25, 50, 100]

export type UsersSearch = {
  page: number
  pageSize: number
  sortBy: string
  sortDirection: "asc" | "desc"
  filters: Filter[]
}

export const DEFAULT_USERS_SEARCH: UsersSearch = {
  page: 0,
  pageSize: 10,
  sortBy: "createdAt",
  sortDirection: "desc",
  filters: [],
}

function isFilter(value: unknown): value is Filter {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as Filter).id === "string" &&
    typeof (value as Filter).field === "string" &&
    typeof (value as Filter).operator === "string" &&
    Array.isArray((value as Filter).values)
  )
}

export const Route = createFileRoute("/home/users/")({
  validateSearch: (search: Record<string, unknown>): UsersSearch => {
    const page = Number(search.page)
    const pageSize = Number(search.pageSize)

    return {
      page: Number.isInteger(page) && page >= 0 ? page : 0,
      pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : 10,
      sortBy: typeof search.sortBy === "string" ? search.sortBy : "createdAt",
      sortDirection: search.sortDirection === "asc" ? "asc" : "desc",
      filters: Array.isArray(search.filters)
        ? search.filters.filter(isFilter)
        : [],
    }
  },
  beforeLoad: ({ context }) => {
    if (context.user.role !== "admin") {
      throw redirect({ to: "/home" })
    }
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(usersQueryOptions(deps)),
  component: UsersPage,
})

function UsersPage() {
  return <UsersDataGrid />
}
