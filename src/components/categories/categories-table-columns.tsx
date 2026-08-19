import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
} from "@tanstack/react-table"
import { format } from "date-fns"
import {
  ArrowUpDownIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CategoryRecord } from "@/lib/collection/categories"

export type CategoryTableRow = CategoryRecord & { habitsCount: number }

export const categoriesTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
})

const columnHelper = createColumnHelper<
  typeof categoriesTableFeatures,
  CategoryTableRow
>()

export function createCategoriesTableColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (category: CategoryTableRow) => void
  onDelete: (category: CategoryTableRow) => void
}) {
  return columnHelper.columns([
    columnHelper.accessor("name", {
      sortFn: "alphanumeric",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span
            className="size-3 shrink-0 rounded-full ring-1 ring-border"
            style={{ backgroundColor: row.original.color }}
          />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    }),
    columnHelper.accessor("habitsCount", {
      sortFn: "basic",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Habits
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => {
        const habitCount = row.original.habitsCount
        return (
          <span className="text-muted-foreground">
            {habitCount} habit{habitCount === 1 ? "" : "s"}
          </span>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      sortFn: "basic",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      sortFn: "basic",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDownIcon data-icon="inline-end" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {format(new Date(row.original.updatedAt), "MMM d, yyyy")}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit(row.original)}>
                  <PencilIcon />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(row.original)}
                >
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    }),
  ])
}
