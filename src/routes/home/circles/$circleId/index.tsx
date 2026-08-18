import { useEffect, useRef, useState } from "react"
import type { Collection } from "@tanstack/db"
import type { OfflineExecutor } from "@tanstack/offline-transactions"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  CheckIcon,
  CopyIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"

import { memberRoles, regenerateJoinCode } from "@/actions/circles"
import { CircleColorDot } from "@/components/circles/circle-color-dot"
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
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Item, ItemActions, ItemContent, ItemTitle } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import type { CircleRecord } from "@/lib/data/circles"
import { getCirclesCollection } from "@/lib/data/circles"
import { useCollection } from "@/lib/data/collection"
import { useOfflineExecutor } from "@/lib/db/offline"

export const Route = createFileRoute("/home/circles/$circleId/")({
  component: CircleDetailPage,
})

type CirclesCollectionType = Collection<CircleRecord, string>

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function InviteCard({
  collection,
  organizationId,
  joinCode,
  canRegenerate,
}: {
  collection: CirclesCollectionType | undefined
  organizationId: string
  joinCode: string
  canRegenerate: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const inviteLink = `${origin}/home/circles/join/${joinCode}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite people</CardTitle>
        <CardDescription>
          Anyone with this link can join this circle.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input readOnly value={inviteLink} className="font-mono text-xs" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(inviteLink)
                setCopied(true)
                clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy"}
            </Button>
            {canRegenerate && (
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={async () => {
                  setPending(true)
                  setError(null)
                  const { error: regenerateError } = await regenerateJoinCode({
                    data: { organizationId },
                  })
                  setPending(false)
                  if (regenerateError) {
                    setError(regenerateError.message)
                    return
                  }
                  await collection?.utils.refetch()
                }}
              >
                <RefreshCwIcon />
                Regenerate
              </Button>
            )}
          </div>
        </div>
        <FieldError>{error}</FieldError>
      </CardContent>
    </Card>
  )
}

function MemberRow({
  collection,
  executor,
  organizationId,
  memberId,
  name,
  role,
  canManage,
  isSelf,
}: {
  collection: CirclesCollectionType
  executor: OfflineExecutor | undefined
  organizationId: string
  memberId: string
  name: string
  role: string
  canManage: boolean
  isSelf: boolean
}) {
  const roles = memberRoles(role)
  const isOwner = roles.includes("owner")
  const isAdmin = roles.includes("admin")

  const handleRoleChange = (nextRole: "admin" | "member") => {
    if (!executor) return
    executor
      .createOfflineTransaction({ mutationFnName: "circles.updateMemberRole" })
      .mutate(() => {
        collection.update(
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
        collection.update(
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

function CircleDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

function CircleDetailPage() {
  const { circleId } = Route.useParams()
  const navigate = useNavigate()
  const collection = useCollection(getCirclesCollection)
  const executor = useOfflineExecutor()
  const user = useHomeUser()
  const { data: matches = [], isLoading: circleLoading } = useLiveQuery((q) => {
    if (!collection) return undefined
    return q
      .from({ circle: collection })
      .where(({ circle }) => eq(circle.slug, circleId))
  })
  const circle = matches.at(0)

  if (!collection || circleLoading) {
    return <CircleDetailSkeleton />
  }

  if (!circle) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          You don't have access to this circle
        </h1>
        <p className="text-sm text-muted-foreground">
          It may not exist, or you may not be a member. Ask an owner or admin
          for the circle's invite link to join.
        </p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link to="/home/circles" />}
        >
          <UsersIcon />
          All circles
        </Button>
      </div>
    )
  }

  const members = circle.members
  const currentMember = members.find((member) => member.userId === user.id)
  const currentRoles = currentMember ? memberRoles(currentMember.role) : []
  const canManage =
    currentRoles.includes("owner") || currentRoles.includes("admin")

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CircleColorDot color={circle.color} className="size-3.5" />
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {circle.name}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">{circle.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {canManage && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    to="/home/circles/$circleId/edit"
                    params={{ circleId }}
                  />
                }
              >
                <PencilIcon />
                Edit
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              disabled={!executor}
              onClick={async () => {
                if (!executor) return
                executor
                  .createOfflineTransaction({ mutationFnName: "circles.leave" })
                  .mutate(() => {
                    collection.delete(circle.id)
                  })
                await navigate({ to: "/home/circles" })
              }}
            >
              <LogOutIcon />
              Leave circle
            </Button>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to="/home/circles" />}
            >
              <UsersIcon />
              All circles
            </Button>
          </div>
        </div>
      </div>

      <InviteCard
        collection={collection}
        organizationId={circle.id}
        joinCode={circle.joinCode}
        canRegenerate={canManage}
      />

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
              collection={collection}
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
    </div>
  )
}
