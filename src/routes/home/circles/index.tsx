import { useState } from "react"
import { useLiveQuery } from "@tanstack/react-db"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { PlusIcon, UserPlusIcon } from "lucide-react"

import { joinCircleByCode } from "@/actions/circles"
import { CircleColorDot } from "@/components/circles/circle-color-dot"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { getCirclesCollection } from "@/lib/data/circles"
import { useCollection } from "@/lib/data/collection"

export const Route = createFileRoute("/home/circles/")({
  component: CirclesPage,
})

function JoinCircleDialog({
  onJoined,
}: {
  onJoined: (slug: string) => void | Promise<void>
}) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [open, setOpen] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setCode("")
          setError(null)
        }
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <UserPlusIcon />
        Join a circle
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={async (event) => {
            event.preventDefault()
            setPending(true)
            const { error: joinError, slug } = await joinCircleByCode({
              data: { code: code.trim().toUpperCase() },
            })
            setPending(false)
            if (joinError || !slug) {
              setError(joinError?.message ?? "No circle found for that code.")
              return
            }
            setOpen(false)
            await onJoined(slug)
          }}
        >
          <DialogHeader>
            <DialogTitle>Join a circle</DialogTitle>
            <DialogDescription>
              Enter an invite code to join an existing circle.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <Field data-invalid={error !== null}>
              <FieldLabel htmlFor="invite-code">Invite code</FieldLabel>
              <Input
                id="invite-code"
                placeholder="FAM7K2Q9"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value)
                  setError(null)
                }}
                autoComplete="off"
              />
              <FieldError>{error}</FieldError>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!code.trim() || pending}>
              {pending && <Spinner data-icon="inline-start" />}
              Join
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CirclesPage() {
  const navigate = useNavigate()
  const collection = useCollection(getCirclesCollection)
  const { data: circles = [], isLoading } = useLiveQuery((q) => {
    if (!collection) return undefined
    return q.from({ circle: collection })
  })
  const circlesLoading = !collection || isLoading

  async function handleJoined(slug: string) {
    await collection?.utils.refetch()
    await navigate({
      to: "/home/circles/$circleId",
      params: { circleId: slug },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Circles
          </h1>
          <p className="text-sm text-muted-foreground">
            Shared streaks with your people.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <JoinCircleDialog onJoined={handleJoined} />
          <Button
            size="sm"
            nativeButton={false}
            render={<Link to="/home/circles/new" />}
          >
            <PlusIcon />
            New circle
          </Button>
        </div>
      </div>

      {circlesLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="size-3 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="mt-1.5 h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : circles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-10 text-center">
            <p className="text-sm font-medium">
              You haven't joined a circle yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Create one, or use "Join a circle" with an invite code.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {circles.map((circle) => (
            <Card key={circle.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CircleColorDot color={circle.color} className="size-3" />
                  <CardTitle>{circle.name}</CardTitle>
                </div>
                <CardDescription className="line-clamp-1">
                  {circle.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <span className="text-xs text-muted-foreground">
                  {circle.members.length === 1
                    ? "1 member"
                    : `${circle.members.length} members`}
                </span>

                <Link
                  to="/home/circles/$circleId"
                  params={{ circleId: circle.slug }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View circle
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
