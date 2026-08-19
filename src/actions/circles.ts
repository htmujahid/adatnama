import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { APIError } from "better-auth/api"
import { sql } from "kysely"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { slugify } from "@/lib/slug"

export type CircleMember = {
  id: string
  userId: string
  role: string
  name: string
}

export type CircleInput = {
  name: string
  description: string
  color: string
}

export function memberRoles(role: string): string[] {
  return role.split(",")
}

function generateJoinCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name)
  const result = await sql<{ slug: string }>`
    SELECT CASE
      WHEN NOT EXISTS (SELECT 1 FROM "organization" WHERE "slug" = ${base})
        THEN ${base}
      ELSE ${base} || '-' || (
        COALESCE((
          SELECT MAX(CAST(substr("slug", length(${base}) + 2) AS INTEGER))
          FROM "organization"
          WHERE "slug" LIKE ${base} || '-%'
            AND substr("slug", length(${base}) + 2) GLOB '[0-9]*'
        ), 1) + 1
      )
    END AS "slug"
  `.execute(db)
  return result.rows[0].slug
}

export const listCircles = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) return []

    const result = await db
      .selectFrom("organization")
      .innerJoin("member as selfMember", (join) =>
        join
          .onRef("selfMember.organizationId", "=", "organization.id")
          .on("selfMember.userId", "=", session.user.id),
      )
      .select(
        sql<string>`coalesce(json_group_array(json_object(
          'id', "organization"."id",
          'name', "organization"."name",
          'slug', "organization"."slug",
          'description', "organization"."description",
          'color', "organization"."color",
          'joinCode', "organization"."joinCode",
          'members', json((
            select coalesce(json_group_array(json_object(
              'id', "member"."id",
              'userId', "member"."userId",
              'role', "member"."role",
              'name', "user"."name"
            ) order by "member"."createdAt"), '[]')
            from "member"
            inner join "user" on "user"."id" = "member"."userId"
            where "member"."organizationId" = "organization"."id"
          ))
        )), '[]')`.as("payload"),
      )
      .executeTakeFirst()

    return JSON.parse(result?.payload ?? "[]") as Array<{
      id: string
      name: string
      slug: string
      description: string
      color: string
      joinCode: string
      members: Array<CircleMember>
    }>
  },
)

export const createCircle = createServerFn({ method: "POST" })
  .validator((data: CircleInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    try {
      const slug = await uniqueSlug(data.name)
      const circle = await auth.api.createOrganization({
        body: {
          name: data.name,
          slug,
          description: data.description,
          color: data.color,
          joinCode: generateJoinCode(),
        },
        headers,
      })
      return { error: null, circle }
    } catch (error) {
      if (error instanceof APIError) {
        return { error: { message: error.message }, circle: null }
      }
      throw error
    }
  })

export const updateCircle = createServerFn({ method: "POST" })
  .validator((data: { organizationId: string } & CircleInput) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const { organizationId, ...input } = data
    try {
      const circle = await auth.api.updateOrganization({
        body: { organizationId, data: input },
        headers,
      })
      return { error: null, circle }
    } catch (error) {
      if (error instanceof APIError) {
        return { error: { message: error.message }, circle: null }
      }
      throw error
    }
  })

export const leaveCircle = createServerFn({ method: "POST" })
  .validator((data: { organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    try {
      await auth.api.leaveOrganization({
        body: { organizationId: data.organizationId },
        headers,
      })
      return { error: null }
    } catch (error) {
      if (error instanceof APIError)
        return { error: { message: error.message } }
      throw error
    }
  })

export const regenerateJoinCode = createServerFn({ method: "POST" })
  .validator((data: { organizationId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    try {
      const joinCode = generateJoinCode()
      const organization = await auth.api.updateOrganization({
        body: { organizationId: data.organizationId, data: { joinCode } },
        headers,
      })
      if (!organization) {
        return {
          error: { message: "Circle not found." },
          joinCode: null,
        }
      }
      return { error: null, joinCode: organization.joinCode }
    } catch (error) {
      if (error instanceof APIError) {
        return { error: { message: error.message }, joinCode: null }
      }
      throw error
    }
  })

export const previewCircleByCode = createServerFn({ method: "GET" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const code = data.code.trim().toUpperCase()
    const circle = await db
      .selectFrom("organization")
      .leftJoin("member", "member.organizationId", "organization.id")
      .select([
        "organization.id",
        "organization.name",
        "organization.slug",
        "organization.description",
        "organization.color",
      ])
      .select((eb) => eb.fn.count<number>("member.id").as("memberCount"))
      .where("organization.joinCode", "=", code)
      .groupBy("organization.id")
      .executeTakeFirst()

    return { circle: circle ?? null }
  })

export const joinCircleByCode = createServerFn({ method: "POST" })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { error: { message: "You must be signed in." }, slug: null }
    }

    const code = data.code.trim().toUpperCase()
    const organization = await db
      .selectFrom("organization")
      .select(["id", "slug"])
      .where("joinCode", "=", code)
      .executeTakeFirst()
    if (!organization) {
      return {
        error: { message: "No circle found for that code." },
        slug: null,
      }
    }

    try {
      await auth.api.addMember({
        body: {
          organizationId: organization.id,
          userId: session.user.id,
          role: "member",
        },
        headers,
      })
    } catch (error) {
      const alreadyMember =
        error instanceof APIError && error.message.includes("already a member")
      if (!alreadyMember) {
        if (error instanceof APIError) {
          return { error: { message: error.message }, slug: null }
        }
        throw error
      }
    }

    return { error: null, slug: organization.slug }
  })

export const updateMemberRole = createServerFn({ method: "POST" })
  .validator(
    (data: {
      organizationId: string
      memberId: string
      role: "admin" | "member"
    }) => data,
  )
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    try {
      await auth.api.updateMemberRole({
        body: {
          organizationId: data.organizationId,
          memberId: data.memberId,
          role: data.role,
        },
        headers,
      })
      return { error: null }
    } catch (error) {
      if (error instanceof APIError)
        return { error: { message: error.message } }
      throw error
    }
  })

export const removeMember = createServerFn({ method: "POST" })
  .validator((data: { organizationId: string; memberId: string }) => data)
  .handler(async ({ data }) => {
    const headers = getRequestHeaders()
    try {
      await auth.api.removeMember({
        body: {
          organizationId: data.organizationId,
          memberIdOrEmail: data.memberId,
        },
        headers,
      })
      return { error: null }
    } catch (error) {
      if (error instanceof APIError)
        return { error: { message: error.message } }
      throw error
    }
  })
