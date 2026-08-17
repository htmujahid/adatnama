import { env } from "cloudflare:workers"

const AVATAR_PREFIX = "avatars"

function avatarKeyFromUrl(url: string): string | null {
  const prefix = `${env.R2_PUBLIC_URL}/${AVATAR_PREFIX}/`
  return url.startsWith(prefix) ? url.slice(env.R2_PUBLIC_URL.length + 1) : null
}

export async function putAvatarObject(userId: string, file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const key = `${AVATAR_PREFIX}/${userId}/${crypto.randomUUID()}.${extension}`

  await env.AVATARS_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  })

  return `${env.R2_PUBLIC_URL}/${key}`
}

export async function deleteAvatarObject(url: string | null | undefined) {
  if (!url) return

  const key = avatarKeyFromUrl(url)
  if (key) {
    await env.AVATARS_BUCKET.delete(key)
  }
}
