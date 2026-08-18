import { Badge } from "@/components/ui/badge"
import { useCategories } from "@/hooks/use-categories"
import { cn } from "@/lib/utils"

export function CategoryBadge({
  categoryId,
  className,
}: {
  categoryId: string
  className?: string
}) {
  const categories = useCategories()
  const category = categories.find((c) => c.id === categoryId)

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
