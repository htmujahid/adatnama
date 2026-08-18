import { useState } from "react"
import { safeRandomUUID, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import {
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import { CreateCategoryDialog } from "@/components/categories/create-category-dialog"
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
import { useHabits } from "@/hooks/use-habits"
import { useHomeUser } from "@/hooks/use-home-user"
import type { CategoryInput, CategoryRecord } from "@/lib/collection/categories"
import { categoriesCollection } from "@/lib/collection/categories"
import { useOfflineExecutor } from "@/lib/db/offline"

export const Route = createFileRoute("/home/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  const user = useHomeUser()
  const executor = useOfflineExecutor()
  const { data: categories = [], isLoading: categoriesLoading } = useLiveQuery(
    (q) => q.from({ category: categoriesCollection }),
  )
  const { habits } = useHabits()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryRecord | undefined>(undefined)

  function handleSave(input: CategoryInput) {
    if (!executor) return
    if (editing) {
      const editingId = editing.id
      executor
        .createOfflineTransaction({ mutationFnName: "categories.update" })
        .mutate(() => {
          categoriesCollection.update(editingId, (draft) => {
            draft.name = input.name
            draft.color = input.color
          })
        })
      return
    }
    const now = new Date().toISOString()
    executor
      .createOfflineTransaction({ mutationFnName: "categories.create" })
      .mutate(() => {
        categoriesCollection.insert({
          id: safeRandomUUID(),
          userId: user.id,
          name: input.name,
          color: input.color,
          createdAt: now,
          updatedAt: now,
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

  function openCreate() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(category: CategoryRecord) {
    setEditing(category)
    setDialogOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground">
            Yours to define — every habit picks from the categories you create
            here.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <PlusIcon />
          New category
        </Button>
      </div>

      {categoriesLoading ? (
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
      ) : categories.length === 0 ? (
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
            <Button size="sm" onClick={openCreate}>
              <PlusIcon />
              New category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const habitCount = habits.filter(
              (habit) => habit.categoryId === category.id,
            ).length

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
                        <DropdownMenuItem onClick={() => openEdit(category)}>
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
      )}

      <CreateCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
        onSaved={handleSave}
      />
    </div>
  )
}
