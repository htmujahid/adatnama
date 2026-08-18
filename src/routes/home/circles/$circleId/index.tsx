import { useEffect, useRef, useState } from "react"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
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

import {
  leaveCircle,
  memberRoles,
  regenerateJoinCode,
  removeMember,
  updateMemberRole,
} from "@/actions/circles"
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
import { useHomeUser } from "@/hooks/use-home-user"
import { circleQueryOptions, circlesQueryOptions } from "@/lib/data/circles"

export const Route = createFileRoute("/home/circles/$circleId/")({
  component: CircleDetailPage,
})

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function InviteCard({
  organizationId,
  circleId,
  joinCode,
  canRegenerate,
}: {
  organizationId: string
  circleId: string
  joinCode: string
  canRegenerate: boolean
}) {
  const queryClient = useQueryClient()
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
                  await queryClient.invalidateQueries({
                    queryKey: circleQueryOptions(circleId).queryKey,
                  })
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
  organizationId,
  circleId,
  memberId,
  name,
  role,
  canManage,
  isSelf,
}: {
  organizationId: string
  circleId: string
  memberId: string
  name: string
  role: string
  canManage: boolean
  isSelf: boolean
}) {
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const roles = memberRoles(role)
  const isOwner = roles.includes("owner")
  const isAdmin = roles.includes("admin")

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: circleQueryOptions(circleId).queryKey,
    })

  const handleRoleChange = async (nextRole: "admin" | "member") => {
    setPending(true)
    setError(null)
    const { error: roleError } = await updateMemberRole({
      data: { organizationId, memberId, role: nextRole },
    })
    setPending(false)
    if (roleError) {
      setError(roleError.message)
      return
    }
    await refresh()
  }

  const handleRemove = async () => {
    setPending(true)
    setError(null)
    const { error: removeError } = await removeMember({
      data: { organizationId, memberId },
    })
    setPending(false)
    if (removeError) {
      setError(removeError.message)
      return
    }
    await refresh()
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
        <FieldError>{error}</FieldError>
      </ItemContent>
      {canManage && !isOwner && !isSelf && (
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" disabled={pending} />}
            >
              <MoreHorizontalIcon />
              <span className="sr-only">Manage member</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAdmin ? (
                <DropdownMenuItem
                  onClick={() => void handleRoleChange("member")}
                >
                  Make member
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => void handleRoleChange("admin")}
                >
                  Make admin
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void handleRemove()}
              >
                Remove from circle
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      )}
    </Item>
  )
}

function CircleDetailPage() {
  const { circleId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useHomeUser()
  const { data } = useSuspenseQuery(circleQueryOptions(circleId))
  const [leaveError, setLeaveError] = useState<string | null>(null)
  const [leavePending, setLeavePending] = useState(false)

  if (data.notMember) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          You're not a member of this circle
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask an owner or admin for the circle's invite link to join.
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

  const circle = data.circle

  if (!circle) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Circle not found
        </h1>
        <p className="text-sm text-muted-foreground">
          This circle doesn't exist or may have been removed.
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

  const currentMember = circle.members.find(
    (member) => member.userId === user.id,
  )
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
              disabled={leavePending}
              onClick={async () => {
                setLeavePending(true)
                setLeaveError(null)
                const { error } = await leaveCircle({
                  data: { organizationId: circle.id },
                })
                setLeavePending(false)
                if (error) {
                  setLeaveError(error.message)
                  return
                }
                await queryClient.invalidateQueries({
                  queryKey: circlesQueryOptions().queryKey,
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
          <FieldError>{leaveError}</FieldError>
        </div>
      </div>

      <InviteCard
        organizationId={circle.id}
        circleId={circleId}
        joinCode={circle.joinCode}
        canRegenerate={canManage}
      />

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {circle.members.length === 1
              ? "1 member"
              : `${circle.members.length} members`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {circle.members.map((member) => (
            <MemberRow
              key={member.id}
              organizationId={circle.id}
              circleId={circleId}
              memberId={member.id}
              name={member.user.name}
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
