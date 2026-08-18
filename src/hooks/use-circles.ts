import { useSyncExternalStore } from "react"

import { createHabit } from "@/hooks/use-habit-catalog"
import type { Circle, CircleMemberHabit } from "@/routes/home/-circles-data"
import { CIRCLES } from "@/routes/home/-circles-data"

export type CircleInput = {
  name: string
  description: string
  color: string
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "circle"
}

function applyEdit(circle: Circle, edit: CircleInput | undefined): Circle {
  if (!edit) return circle
  return { ...circle, ...edit }
}

function generateInviteCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()
}

// Session-only circle catalog layered on top of the mock data in
// -circles-data.ts. Not persisted anywhere yet — resets on reload.
let state: {
  created: ReadonlyArray<Circle>
  edits: ReadonlyMap<string, CircleInput>
  left: ReadonlySet<string>
  inviteCodes: ReadonlyMap<string, string>
  duplicated: ReadonlySet<string>
} = {
  created: [],
  edits: new Map(),
  // Seed: the user hasn't joined this one yet, so the join-by-code/link flow
  // has something to demo.
  left: new Set(["book-club"]),
  inviteCodes: new Map(),
  duplicated: new Set(),
}
const listeners = new Set<() => void>()

function publish(next: typeof state) {
  state = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function allCirclesFrom(snapshot: typeof state): Circle[] {
  return [...CIRCLES, ...snapshot.created].map((circle) =>
    applyEdit(circle, snapshot.edits.get(circle.id)),
  )
}

function allCircles(): Circle[] {
  return allCirclesFrom(state)
}

export function getInviteCode(circle: Circle): string {
  return state.inviteCodes.get(circle.id) ?? circle.inviteCode
}

export function inviteLinkFor(circle: Circle): string {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return `${origin}/home/circles/join/${getInviteCode(circle)}`
}

export function duplicateHabitKey(
  circleId: string,
  memberId: string,
  habitId: string,
) {
  return `${circleId}:${memberId}:${habitId}`
}

export function useCircles(): Circle[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return allCirclesFrom(snapshot).filter(
    (circle) => !snapshot.left.has(circle.id),
  )
}

export function useCircle(id: string): Circle | undefined {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return allCirclesFrom(snapshot).find((circle) => circle.id === id)
}

export function useIsCircleMember(id: string): boolean {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return !snapshot.left.has(id)
}

export function useIsHabitDuplicated(key: string): boolean {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return snapshot.duplicated.has(key)
}

export function createCircle(input: CircleInput): Circle {
  const existingIds = new Set(
    [...CIRCLES, ...state.created].map((circle) => circle.id),
  )
  const base = slugify(input.name)
  let id = base
  let suffix = 2
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }

  const circle: Circle = {
    id,
    name: input.name,
    description: input.description,
    color: input.color,
    inviteCode: generateInviteCode(),
    members: [],
  }

  publish({ ...state, created: [...state.created, circle] })
  return circle
}

export function updateCircle(id: string, input: CircleInput) {
  publish({ ...state, edits: new Map(state.edits).set(id, input) })
}

export function leaveCircle(id: string) {
  publish({ ...state, left: new Set(state.left).add(id) })
}

export function joinCircle(id: string) {
  const left = new Set(state.left)
  left.delete(id)
  publish({ ...state, left })
}

export function regenerateInviteCode(id: string): string {
  const code = generateInviteCode()
  publish({
    ...state,
    inviteCodes: new Map(state.inviteCodes).set(id, code),
  })
  return code
}

export function findCircleByInviteCode(code: string): Circle | undefined {
  return allCircles().find((circle) => getInviteCode(circle) === code)
}

export function duplicateMemberHabit(
  circleId: string,
  memberId: string,
  habit: CircleMemberHabit,
) {
  createHabit({
    name: habit.name,
    category: habit.category,
    description: habit.description,
    target: habit.target,
    frequency: habit.frequency,
    reminderTime: null,
    freezesTotal: 2,
  })

  publish({
    ...state,
    duplicated: new Set(state.duplicated).add(
      duplicateHabitKey(circleId, memberId, habit.id),
    ),
  })
}
