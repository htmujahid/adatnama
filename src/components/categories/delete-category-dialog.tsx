import { Trash2Icon } from "lucide-react"

import type { CategoryTableRow } from "@/components/categories/categories-table-columns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryTableRow
  onDeleted: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete "{category?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {category?.habitsCount
              ? `${category.habitsCount} habit${category.habitsCount === 1 ? "" : "s"} will be left without a category. `
              : ""}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDeleted}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
