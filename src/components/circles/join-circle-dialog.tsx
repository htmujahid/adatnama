import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { UserPlusIcon } from "lucide-react"

import { joinCircleByCode } from "@/actions/circles"
import { Button } from "@/components/ui/button"
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
import { Spinner } from "@/components/ui/spinner"
import { useCirclesCollection } from "@/lib/collection/circles"

export function JoinCircleDialog() {
  const navigate = useNavigate()
  const circlesCollection = useCirclesCollection()
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
            await circlesCollection.utils.refetch()
            await navigate({
              to: "/home/circles/$circleId",
              params: { circleId: slug },
            })
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
