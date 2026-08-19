import { createFileRoute } from "@tanstack/react-router"

import { CategoriesGrid } from "@/components/categories/categories-grid"
import { NewCategoryButton } from "@/components/categories/new-category-button"

export const Route = createFileRoute("/home/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
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
        <NewCategoryButton />
      </div>

      <CategoriesGrid />
    </div>
  )
}
