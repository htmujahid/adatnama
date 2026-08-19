import { eq, useLiveQuery } from "@tanstack/react-db"
import { Link } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"

import { PageHeader } from "@/components/layouts/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCirclesCollection } from "@/lib/collection/circles"

export function EditCircleHeader({ circleId }: { circleId: string }) {
  const circlesCollection = useCirclesCollection()
  const { data: matches = [], isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
    [circleId],
  )
  const circle = matches.at(0)

  if (isLoading) {
    return <Skeleton className="h-8 w-64" />
  }

  if (!circle) {
    return null
  }

  return (
    <PageHeader
      title={<>Edit {circle.name}</>}
      description="Update the details for this circle."
    >
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link to="/home/circles/$circleId" params={{ circleId }} />}
      >
        <UsersIcon />
        Back to circle
      </Button>
    </PageHeader>
  )
}
