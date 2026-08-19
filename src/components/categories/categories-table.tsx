import { useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { useTable } from "@tanstack/react-table"
import { TagIcon } from "lucide-react"

import {
  categoriesTableFeatures,
  createCategoriesTableColumns,
} from "@/components/categories/categories-table-columns"
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import { NewCategoryButton } from "@/components/categories/new-category-button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CategoryInput, CategoryRecord } from "@/lib/collection/categories"
import { useCategoriesCollection } from "@/lib/collection/categories"
import { useOfflineExecutor } from "@/lib/db/offline"

export function CategoriesTable() {
  const categoriesCollection = useCategoriesCollection()
  const executor = useOfflineExecutor()
  const { data: categories = [], isLoading } = useLiveQuery((q) =>
    q.from({ category: categoriesCollection }),
  )
  const [editing, setEditing] = useState<CategoryRecord | undefined>(undefined)
  const [deleting, setDeleting] = useState<CategoryRecord | undefined>(
    undefined,
  )

  function handleSave(input: CategoryInput) {
    if (!executor || !editing) return
    const editingId = editing.id
    executor
      .createOfflineTransaction({ mutationFnName: "categories.update" })
      .mutate(() => {
        categoriesCollection.update(editingId, (draft) => {
          draft.name = input.name
          draft.color = input.color
        })
      })
  }

  function handleDelete() {
    if (!executor || !deleting) return
    const deletingId = deleting.id
    executor
      .createOfflineTransaction({ mutationFnName: "categories.delete" })
      .mutate(() => {
        categoriesCollection.delete(deletingId)
      })
    setDeleting(undefined)
  }

  const columns = createCategoriesTableColumns({
    onEdit: setEditing,
    onDelete: setDeleting,
  })

  const table = useTable({
    features: categoriesTableFeatures,
    columns,
    data: categories,
    initialState: {
      sorting: [{ id: "name", desc: false }],
    },
  })

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Habits</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-3 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <TagIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        You don't have any categories yet.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Create your first one to start organizing your habits.
                      </p>
                    </div>
                    <NewCategoryButton />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateCategoryDialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
        category={editing}
        onSaved={handleSave}
      />

      <DeleteCategoryDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
        category={deleting}
        onDeleted={handleDelete}
      />
    </>
  )
}
