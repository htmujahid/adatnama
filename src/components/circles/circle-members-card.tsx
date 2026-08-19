import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { MoreHorizontalIcon } from "lucide-react"

import { memberRoles } from "@/actions/circles"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { useCirclesCollection } from "@/lib/collection/circles"
import { useOfflineExecutor } from "@/lib/db/offline"

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function MemberRow({
  executor,
  organizationId,
  memberId,
  name,
  role,
  canManage,
  isSelf,
}: {
  executor: OfflineExecutor | undefined
  organizationId: string
  memberId: string
  name: string
  role: string
  canManage: boolean
  isSelf: boolean
}) {
  const circlesCollection = useCirclesCollection()
  const roles = memberRoles(role)
  const isOwner = roles.includes("owner")
  const isAdmin = roles.includes("admin")

  const handleRoleChange = (nextRole: "admin" | "member") => {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "circles.updateMemberRole" })
      .mutate(() => {
        circlesCollection.update(
          organizationId,
          { metadata: { memberId, role: nextRole } },
          (draft) => {
            const member = draft.members.find((m) => m.id === memberId)
            if (member) member.role = nextRole
          },
        )
      })
  }

  const handleRemove = () => {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "circles.removeMember" })
      .mutate(() => {
        circlesCollection.update(
          organizationId,
          { metadata: { memberId } },
          (draft) => {
            draft.members = draft.members.filter((m) => m.id !== memberId)
          },
        )
      })
  }

  return (
    <Item variant="outline" size="sm">
      <ItemContent>
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{initialsFor(name)}</AvatarFallback>
          </Avatar>
          <ItemTitle>{name}</ItemTitle>
          {isOwner && <Badge variant="secondary">Owner</Badge>}
          {!isOwner && isAdmin && <Badge variant="secondary">Admin</Badge>}
        </div>
      </ItemContent>
      {canManage && !isOwner && !isSelf && (
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">Manage member</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin ? (
                <DropdownMenuItem onClick={() => handleRoleChange("member")}>
                  Make member
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
                  Make admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleRemove}>
                Remove from circle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      )}
    </Item>
  )
}

export function CircleMembersCard({ circleId }: { circleId: string }) {
  const circlesCollection = useCirclesCollection()
  const executor = useOfflineExecutor()
  const user = useHomeUser()
  const { data: matches = [], isLoading } = useLiveQuery({
    query: (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
  })
  const circle = matches.at(0)

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!circle) {
    return null
  }

  const members = circle.members
  const currentMember = members.find((member) => member.userId === user.id)
  const currentRoles = currentMember ? memberRoles(currentMember.role) : []
  const canManage =
    currentRoles.includes("owner") || currentRoles.includes("admin")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {members.length === 1 ? "1 member" : `${members.length} members`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            executor={executor}
            organizationId={circle.id}
            memberId={member.id}
            name={member.name}
            role={member.role}
            canManage={canManage}
            isSelf={member.userId === user.id}
          />
        ))}
      </CardContent>
    </Card>
  )
}
