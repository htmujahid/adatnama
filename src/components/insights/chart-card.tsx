import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ChartCard({
  title,
  description,
  children,
  className,
  centered,
}: {
  title: string
  description: string
  children: React.ReactNode
  className?: string
  centered?: boolean
}) {
  return (
    <Card className={className}>
      <CardHeader className={centered ? "items-center pb-0" : undefined}>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
