import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

import { removeAvatar, uploadAvatar } from "@/actions/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { AVATAR_ACCEPT, AVATAR_MAX_SIZE_BYTES } from "@/lib/avatar"
import { sessionQueryOptions } from "@/lib/data/auth"

export function AvatarForm({
  user,
}: {
  user: { name: string; image?: string | null }
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const refreshSession = async () => {
    queryClient.removeQueries({ queryKey: sessionQueryOptions().queryKey })
    await router.invalidate({ sync: true })
  }

  const [, { openFileDialog, getInputProps, clearFiles }] = useFileUpload({
    accept: AVATAR_ACCEPT,
    maxSize: AVATAR_MAX_SIZE_BYTES,
    onFilesAdded: async (addedFiles) => {
      const file = addedFiles[0]?.file
      if (!(file instanceof File)) return

      setError(null)
      setIsUploading(true)

      const formData = new FormData()
      formData.set("file", file)

      const { error: uploadError } = await uploadAvatar({ data: formData })
      clearFiles()

      if (uploadError) {
        setError(uploadError.message)
      } else {
        await refreshSession()
      }
      setIsUploading(false)
    },
    onError: (errors) => setError(errors[0] ?? null),
  })

  const handleRemove = async () => {
    setError(null)
    setIsRemoving(true)

    const { error: removeError } = await removeAvatar()
    if (removeError) {
      setError(removeError.message)
    } else {
      await refreshSession()
    }
    setIsRemoving(false)
  }

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={user.image ?? undefined} alt={user.name} />
        <AvatarFallback className="text-lg">{initial}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={isUploading || isRemoving}
          >
            {isUploading && <Spinner data-icon="inline-start" />}
            Upload image
          </Button>

          {user.image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading || isRemoving}
            >
              {isRemoving && <Spinner data-icon="inline-start" />}
              Remove
            </Button>
          )}

          <input {...getInputProps()} className="hidden" />
        </div>

        <FieldDescription>
          JPG, PNG, WEBP or GIF. Max {formatBytes(AVATAR_MAX_SIZE_BYTES)}.
        </FieldDescription>

        <FieldError>{error}</FieldError>
      </div>
    </div>
  )
}
