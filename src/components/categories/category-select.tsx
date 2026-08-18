import { useState } from "react"
import { safeRandomUUID, useLiveQuery } from "@tanstack/react-db"
import { PlusIcon, TagIcon } from "lucide-react"

import { CreateCategoryDialog } from "@/components/categories/create-category-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import type { CategoryInput } from "@/lib/collection/categories"
import { categoriesCollection } from "@/lib/collection/categories"
import { useOfflineExecutor } from "@/lib/db/offline"

const CREATE_VALUE = "__create__"

export function CategorySelect({
  id,
  value,
  onChange,
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const user = useHomeUser()
  const executor = useOfflineExecutor()
  const { data: categories = [], isLoading } = useLiveQuery((q) =>
    q.from({ category: categoriesCollection }),
  )
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleCreate(input: CategoryInput) {
    if (!executor) return
    const now = new Date().toISOString()
    const categoryId = safeRandomUUID()
    executor
      .createOfflineTransaction({ mutationFnName: "categories.create" })
      .mutate(() => {
        categoriesCollection.insert({
          id: categoryId,
          userId: user.id,
          name: input.name,
          color: input.color,
          createdAt: now,
          updatedAt: now,
        })
      })
    onChange(categoryId)
  }

  if (isLoading) {
    return <Skeleton className={className ?? "h-9 w-full"} />
  }

  if (categories.length === 0) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start border-dashed text-muted-foreground"
          onClick={() => setDialogOpen(true)}
        >
          <TagIcon />
          No categories yet — create one
        </Button>
        <CreateCategoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSaved={handleCreate}
        />
      </>
    )
  }

  return (
    <>
      <Select
        value={value}
        onValueChange={(next) => {
          if (!next) return
          if (next === CREATE_VALUE) {
            setDialogOpen(true)
            return
          }
          onChange(next)
        }}
      >
        <SelectTrigger id={id} className={className ?? "w-full"}>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-border"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value={CREATE_VALUE} className="text-primary">
            <span className="inline-flex items-center gap-2">
              <PlusIcon className="size-3.5" />
              New category
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
      <CreateCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleCreate}
      />
    </>
  )
}
