"use client"

import { useEffect, useState, useTransition } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { useTable } from "@tanstack/react-table"
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { DownloadIcon, UserPlusIcon } from "lucide-react"

import { listUsers } from "@/actions/auth"
import {
  DataGrid,
  dataGridFeatures,
} from "@/components/reui/data-grid/data-grid"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { Filters } from "@/components/reui/filters"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { usersQueryOptions } from "@/lib/data/auth"
import { exportRowsToCsv } from "@/lib/export"

import { usersColumns, usersExportColumns } from "./users-columns"
import { usersFilterFields } from "./users-filter-fields"

const routeApi = getRouteApi("/home/users/")

const EXPORT_ROW_LIMIT = 10000

const FILTERS_DEBOUNCE_MS = 400

export function UsersDataGrid() {
  const search = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const { data, isFetching } = useSuspenseQuery(usersQueryOptions(search))
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isNavPending, startNavTransition] = useTransition()

  const [localFilters, setLocalFilters] = useState(search.filters)

  useEffect(() => {
    setLocalFilters(search.filters)
  }, [search.filters])

  useEffect(() => {
    if (JSON.stringify(localFilters) === JSON.stringify(search.filters)) {
      return
    }

    const timer = setTimeout(() => {
      startNavTransition(async () => {
        await navigate({
          search: (prev) => ({ ...prev, filters: localFilters, page: 0 }),
          replace: true,
        })
      })
    }, FILTERS_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [localFilters, search.filters, navigate])

  const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const current: PaginationState = {
      pageIndex: search.page,
      pageSize: search.pageSize,
    }
    const next = typeof updater === "function" ? updater(current) : updater

    startNavTransition(async () => {
      await navigate({
        search: (prev) => ({
          ...prev,
          page: next.pageIndex,
          pageSize: next.pageSize,
        }),
        replace: true,
      })
    })
  }

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const current: SortingState = [
      { id: search.sortBy, desc: search.sortDirection === "desc" },
    ]
    const next = typeof updater === "function" ? updater(current) : updater
    const nextSort = next.at(0)

    startNavTransition(async () => {
      await navigate({
        search: (prev) => ({
          ...prev,
          sortBy: nextSort?.id ?? "createdAt",
          sortDirection: nextSort?.desc ? "desc" : "asc",
          page: 0,
        }),
        replace: true,
      })
    })
  }

  const table = useTable({
    features: dataGridFeatures,
    columns: usersColumns,
    data: data.users,
    rowCount: data.total,
    manualPagination: true,
    manualSorting: true,
    state: {
      pagination: { pageIndex: search.page, pageSize: search.pageSize },
      sorting: [{ id: search.sortBy, desc: search.sortDirection === "desc" }],
    },
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
  })

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)

    try {
      const exportData = await listUsers({
        data: {
          page: 0,
          pageSize: EXPORT_ROW_LIMIT,
          sortBy: search.sortBy,
          sortDirection: search.sortDirection,
          filters: search.filters,
        },
      })
      exportRowsToCsv(
        `users-${format(new Date(), "yyyy-MM-dd")}.csv`,
        exportData.users,
        usersExportColumns,
      )
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Failed to export users",
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DataGrid
      table={table}
      recordCount={data.total}
      isLoading={isFetching || isNavPending}
      tableLayout={{ rowBorder: true }}
    >
      <Card className="w-full gap-0 py-0">
        <CardHeader className="flex items-center justify-between px-3.5 py-2">
          <Filters
            size="sm"
            filters={localFilters}
            fields={usersFilterFields}
            onChange={setLocalFilters}
          />
          <CardAction className="flex items-center gap-2">
            {exportError && (
              <span className="text-sm text-destructive">{exportError}</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Spinner /> : <DownloadIcon />}
              Export
            </Button>
            <Button size="sm" render={<Link to="/home/users/create" />}>
              <UserPlusIcon />
              Create user
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="border-y px-0">
          <DataGridScrollArea>
            <DataGridTable />
          </DataGridScrollArea>
        </CardContent>
        <CardFooter className="border-none bg-transparent! px-3.5 py-2">
          <DataGridPagination />
        </CardFooter>
      </Card>
    </DataGrid>
  )
}
