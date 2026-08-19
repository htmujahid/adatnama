import { useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import {
  MoreHorizontalIcon,
  PencilIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import { CreateCategoryDialog } from "@/components/categories/create-category-dialog"
import { NewCategoryButton } from "@/components/categories/new-category-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import type { CategoryInput, CategoryRecord } from "@/lib/collection/categories"
import { useCategoriesCollection } from "@/lib/collection/categories"
import { habitsCollection } from "@/lib/collection/habits"
import { useOfflineExecutor } from "@/lib/db/offline"

export function CategoriesGrid() {
  const categoriesCollection = useCategoriesCollection()
  const executor = useOfflineExecutor()
  const { data: rows = [], isLoading } = useLiveQuery((q) =>
    q.from({ category: categoriesCollection }).leftJoin(
      { habit: habitsCollection },
      ({ category, habit }) => eq(habit.categoryId, category.id),
    ),
  )
  const [editing, setEditing] = useState<CategoryRecord | undefined>(undefined)

  const categoryById = new Map<string, CategoryRecord>()
  const habitCounts = new Map<string, number>()
  for (const { category, habit } of rows) {
    categoryById.set(category.id, category)
    if (habit) {
      habitCounts.set(category.id, (habitCounts.get(category.id) ?? 0) + 1)
    }
  }
  const categories = Array.from(categoryById.values())

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

  function handleDelete(categoryId: string) {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "categories.delete" })
      .mutate(() => {
        categoriesCollection.delete(categoryId)
      })
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="size-3 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="mt-1.5 h-4 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
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
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const habitCount = habitCounts.get(category.id) ?? 0

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-full ring-1 ring-border"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle>{category.name}</CardTitle>
                </div>
                <CardDescription>
                  {habitCount} habit{habitCount === 1 ? "" : "s"}
                </CardDescription>
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontalIcon />
                      <span className="sr-only">More</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(category)}>
                        <PencilIcon />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2Icon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <CreateCategoryDialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
        category={editing}
        onSaved={handleSave}
      />
    </>
  )
}
