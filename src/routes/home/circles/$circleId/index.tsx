import { useEffect, useRef, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import {
  CheckIcon,
  CopyIcon,
  CopyPlusIcon,
  FlameIcon,
  LogOutIcon,
  PencilIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react"

import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import {
  duplicateHabitKey,
  duplicateMemberHabit,
  inviteLinkFor,
  joinCircle,
  leaveCircle,
  regenerateInviteCode,
  useCircle,
  useIsCircleMember,
  useIsHabitDuplicated,
} from "@/hooks/use-circles"

import type { CircleMemberHabit } from "../../-circles-data"

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

function DuplicateHabitButton({
  circleId,
  memberId,
  habit,
}: {
  circleId: string
  memberId: string
  habit: CircleMemberHabit
}) {
  const key = duplicateHabitKey(circleId, memberId, habit.id)
  const added = useIsHabitDuplicated(key)

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={added}
      onClick={() => duplicateMemberHabit(circleId, memberId, habit)}
    >
      {added ? <CheckIcon /> : <CopyPlusIcon />}
      {added ? "Added" : "Duplicate"}
    </Button>
  )
}

function InviteCard({
  circleId,
  circleName,
  inviteLink,
}: {
  circleId: string
  circleName: string
  inviteLink: string
}) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite people</CardTitle>
        <CardDescription>
          Anyone with this link can join {circleName}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row">
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateInviteCode(circleId)}
          >
            <RefreshCwIcon />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CircleDetailPage() {
  const { circleId } = Route.useParams()
  const navigate = useNavigate()
  const circle = useCircle(circleId)
  const isMember = useIsCircleMember(circleId)

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

  if (!isMember) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
        <CircleColorDot color={circle.color} className="size-4" />
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {circle.name}
        </h1>
        <p className="text-sm text-muted-foreground">{circle.description}</p>
        <p className="text-xs text-muted-foreground">
          {circle.members.length} member
          {circle.members.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => joinCircle(circleId)}>
            Join circle
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/home/circles" />}
          >
            All circles
          </Button>
        </div>
      </div>
    )
  }

  const checkedIn = circle.members.filter((member) =>
    member.habits.some((habit) => habit.done),
  ).length
  const totalHabits = circle.members.reduce(
    (sum, member) => sum + member.habits.length,
    0,
  )

  const stats = [
    {
      label: "Members",
      value: `${circle.members.length}`,
      badge: "In this circle",
    },
    {
      label: "Checked in today",
      value: `${checkedIn} of ${circle.members.length}`,
      badge: "Members",
    },
    {
      label: "Habits shared",
      value: `${totalHabits}`,
      badge: "Across members",
    },
  ] as const

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                to="/home/circles/$circleId/edit"
                params={{ circleId: circle.id }}
              />
            }
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              leaveCircle(circleId)
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

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stat.value}
              </CardTitle>
              <CardAction>
                <Badge variant="secondary">{stat.badge}</Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>

      <InviteCard
        circleId={circle.id}
        circleName={circle.name}
        inviteLink={inviteLinkFor(circle)}
      />

      <div className="flex flex-col gap-4">
        {circle.members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  <AvatarFallback>{initialsFor(member.name)}</AvatarFallback>
                </Avatar>
                <CardTitle>{member.name}</CardTitle>
                {member.role === "owner" && (
                  <Badge variant="secondary">Owner</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {member.habits.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No habits shared yet.
                </p>
              ) : (
                <ItemGroup>
                  {member.habits.map((habit) => (
                    <Item key={habit.id} variant="outline" size="sm">
                      <ItemContent>
                        <ItemTitle>
                          {habit.name}
                          <Badge variant="secondary">{habit.category}</Badge>
                        </ItemTitle>
                        <ItemDescription>{habit.description}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FlameIcon className="size-3.5 text-primary" />
                          {habit.streak}
                        </span>
                        <DuplicateHabitButton
                          circleId={circle.id}
                          memberId={member.id}
                          habit={habit}
                        />
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
