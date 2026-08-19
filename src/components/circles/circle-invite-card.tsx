import { useEffect, useRef, useState } from "react"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { CheckIcon, CopyIcon, RefreshCwIcon } from "lucide-react"

import { memberRoles, regenerateJoinCode } from "@/actions/circles"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { useCirclesCollection } from "@/lib/collection/circles"

export function CircleInviteCard({ circleId }: { circleId: string }) {
  const circlesCollection = useCirclesCollection()
  const user = useHomeUser()
  const [copied, setCopied] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const { data: matches = [], isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ circle: circlesCollection })
        .where(({ circle }) => eq(circle.slug, circleId)),
    [circleId],
  )
  const circle = matches.at(0)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  if (!circle) {
    return null
  }

  const currentMember = circle.members.find(
    (member) => member.userId === user.id,
  )
  const currentRoles = currentMember ? memberRoles(currentMember.role) : []
  const canRegenerate =
    currentRoles.includes("owner") || currentRoles.includes("admin")

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const inviteLink = `${origin}/home/circles/join/${circle.joinCode}`

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
                    data: { organizationId: circle.id },
                  })
                  setPending(false)
                  if (regenerateError) {
                    setError(regenerateError.message)
                    return
                  }
                  await circlesCollection.utils.refetch()
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
