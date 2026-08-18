import { useLiveQuery } from "@tanstack/react-db"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategoriesCollection } from "@/lib/data/categories"
import { useCollection } from "@/lib/data/collection"
import { cn } from "@/lib/utils"

export function CategoryBadge({
  categoryId,
  className,
}: {
  categoryId: string
  className?: string
}) {
  const collection = useCollection(getCategoriesCollection)
  const { data: categories = [], isLoading } = useLiveQuery((q) => {
    if (!collection) return undefined
    return q.from({ category: collection })
  })
  const category = categories.find((c) => c.id === categoryId)

  if (!collection || isLoading) {
    return <Skeleton className={cn("h-5 w-16 rounded-full", className)} />
  }

  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      <span
        className="size-2 shrink-0 rounded-full ring-1 ring-border"
        style={{
          backgroundColor: category?.color ?? "var(--muted-foreground)",
        }}
      />
      {category?.name ?? categoryId}
    </Badge>
  )
}
