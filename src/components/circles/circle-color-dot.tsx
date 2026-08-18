import { cn } from "@/lib/utils"

export function CircleColorDot({
  color,
  className,
}: {
  color: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full ring-1 ring-border",
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  )
}
