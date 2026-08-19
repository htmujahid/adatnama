import { useState } from "react"
import { safeRandomUUID } from "@tanstack/react-db"
import { PlusIcon } from "lucide-react"

import { CreateCategoryDialog } from "@/components/categories/create-category-dialog"
import { Button } from "@/components/ui/button"
import { useHomeUser } from "@/hooks/use-home-user"
import type { CategoryInput } from "@/lib/collection/categories"
import { useCategoriesCollection } from "@/lib/collection/categories"
import { useOfflineExecutor } from "@/lib/db/offline"

export function NewCategoryButton() {
  const user = useHomeUser()
  const categoriesCollection = useCategoriesCollection()
  const executor = useOfflineExecutor()
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleSave(input: CategoryInput) {
    if (!executor) return
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

  return (
    <>
      <Button size="sm" onClick={() => setDialogOpen(true)}>
        <PlusIcon />
        New category
      </Button>
      <CreateCategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSave}
      />
    </>
  )
}
