import { useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { useTable } from "@tanstack/react-table"
import { TagIcon } from "lucide-react"

import type { CategoryTableRow } from "@/components/categories/categories-table-columns"
import {
  categoriesTableFeatures,
  createCategoriesTableColumns,
} from "@/components/categories/categories-table-columns"
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog"
import { DeleteCategoryDialog } from "@/components/categories/delete-category-dialog"
import { NewCategoryButton } from "@/components/categories/new-category-button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CategoryInput } from "@/lib/collection/categories"
import { useCategoriesCollection } from "@/lib/collection/categories"
import { useHabitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"

export function CategoriesTable() {
  const categoriesCollection = useCategoriesCollection()
  const habitsCollection = useHabitsCollection()
  const executor = useOfflineExecutor()
  const { data: categories = [], isLoading } = useLiveQuery({
    query: (q) => q.from({ category: categoriesCollection }),
  })
  const { data: habits = [] } = useLiveQuery({
    query: (q) => q.from({ habit: habitsCollection }),
  })
  const habitsCountByCategory = new Map<string, number>()
  for (const habit of habits) {
    if (!habit.categoryId) continue
    habitsCountByCategory.set(
      habit.categoryId,
      (habitsCountByCategory.get(habit.categoryId) ?? 0) + 1,
    )
  }
  const rows = categories.map((category) => ({
    ...category,
    habitsCount: habitsCountByCategory.get(category.id) ?? 0,
  }))
  const [editing, setEditing] = useState<CategoryTableRow | undefined>(
    undefined,
  )
  const [deleting, setDeleting] = useState<CategoryTableRow | undefined>(
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
    const linkedHabitIds = habits
      .filter((habit) => habit.categoryId === deletingId)
      .map((habit) => habit.id)
    executor
      .createOfflineTransaction({ mutationFnName: "categories.delete" })
      .mutate(() => {
        if (linkedHabitIds.length > 0) {
          habitsCollection.update(linkedHabitIds, (drafts) => {
            for (const draft of drafts) draft.categoryId = null
          })
        }
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
    data: rows,
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
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
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
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
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
                <TableCell colSpan={5}>
                  <Empty className="p-6">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <TagIcon />
                      </EmptyMedia>
                      <EmptyTitle>No categories yet</EmptyTitle>
                      <EmptyDescription>
                        Create your first one to start organizing your habits.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <NewCategoryButton />
                    </EmptyContent>
                  </Empty>
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
