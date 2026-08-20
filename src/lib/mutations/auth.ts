import { useRouter } from "@tanstack/react-router"

import { setPassword } from "@/actions/auth"
import { removeAvatar, uploadAvatar } from "@/actions/avatar"
import {
  useAccountsCollection,
  useSessionCollection,
} from "@/lib/collection/auth"

export function useRefreshSession() {
  const session = useSessionCollection()
  const router = useRouter()
  return async () => {
    await session.toArrayWhenReady()
    await session.utils.refetch()
    await router.invalidate({ sync: true })
  }
}

export function useAvatarActions() {
  const refreshSession = useRefreshSession()

  return {
    upload: async (formData: FormData) => {
      const result = await uploadAvatar({ data: formData })
      if (result.error) {
        throw new Error(result.error.message)
      }
      await refreshSession()
    },
    remove: async () => {
      const result = await removeAvatar()
      if (result.error) {
        throw new Error(result.error.message)
      }
      await refreshSession()
    },
  }
}

export function useSetPasswordAction() {
  const accounts = useAccountsCollection()
  return async ({ newPassword }: { newPassword: string }) => {
    const result = await setPassword({ data: { newPassword } })
    if (result.error) {
      throw new Error(result.error.message)
    }
    await accounts.utils.refetch()
  }
}
