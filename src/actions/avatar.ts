import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { APIError } from "better-auth/api"

import { auth } from "@/lib/auth"
import { AVATAR_ACCEPTED_TYPES, AVATAR_MAX_SIZE_BYTES } from "@/lib/avatar"
import { deleteAvatarObject, putAvatarObject } from "@/lib/storage"

export const uploadAvatar = createServerFn({ method: "POST" })
  .validator((data: FormData) => {
    const file = data.get("file")
    if (!(file instanceof File)) {
      throw new Error("No file provided.")
    }
    return file
  })
  .handler(async ({ data: file }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      return { error: { message: "Unsupported file type." } }
    }
    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      return { error: { message: "File is too large." } }
    }

    const previousImage = session.user.image
    const image = await putAvatarObject(session.user.id, file)

    try {
      await auth.api.updateUser({ headers, body: { image } })
    } catch (error) {
      await deleteAvatarObject(image)
      if (error instanceof APIError) {
        return { error: { message: error.message } }
      }
      throw error
    }

    await deleteAvatarObject(previousImage)

    return { error: null, image }
  })

export const removeAvatar = createServerFn({ method: "POST" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." } }
    }

    const previousImage = session.user.image

    try {
      await auth.api.updateUser({ headers, body: { image: null } })
    } catch (error) {
      if (error instanceof APIError) {
        return { error: { message: error.message } }
      }
      throw error
    }

    await deleteAvatarObject(previousImage)

    return { error: null }
  },
)
