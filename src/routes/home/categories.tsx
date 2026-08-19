import { createFileRoute } from "@tanstack/react-router"

import { CategoriesTable } from "@/components/categories/categories-table"
import { NewCategoryButton } from "@/components/categories/new-category-button"
import { PageHeader } from "@/components/layouts/page-header"

export const Route = createFileRoute("/home/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Yours to define — every habit picks from the categories you create here."
      >
        <NewCategoryButton />
      </PageHeader>

      <CategoriesTable />
    </div>
  )
}
