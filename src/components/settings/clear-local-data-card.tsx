import { useState } from "react"
import { DatabaseZapIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldError } from "@/components/ui/field"
import { clearBrowserPersistence } from "@/lib/db/browser"
import { useOfflineExecutor } from "@/lib/db/offline"

export function ClearLocalDataCard() {
  const executor = useOfflineExecutor()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClear() {
    setIsClearing(true)
    setError(null)
    try {
      executor?.dispose()
      await clearBrowserPersistence()
      window.location.reload()
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "Failed to clear local data.",
      )
      setIsClearing(false)
    }
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Local data</CardTitle>
        <CardDescription>
          Adatnama keeps an offline copy of your data in this browser. Clearing
          it frees up storage and re-downloads everything from the server.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isClearing}
          onClick={() => setDialogOpen(true)}
        >
          <DatabaseZapIcon />
          {isClearing ? "Clearing…" : "Clear local data"}
        </Button>
        <FieldError>{error}</FieldError>
      </CardFooter>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia>
              <DatabaseZapIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Clear local data?</AlertDialogTitle>
            <AlertDialogDescription>
              The local database on this device will be deleted, including any
              changes that have not synced to the server yet. The app reloads
              afterwards and downloads a fresh copy of your data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleClear}>
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
