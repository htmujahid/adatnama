import { useSyncExternalStore } from "react"

import type { Category } from "@/routes/home/-categories-data"

export type CategoryInput = {
  name: string
  color: string
}

function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "category"
}

function applyEdit(
  category: Category,
  edit: CategoryInput | undefined,
): Category {
  if (!edit) return category
  return { ...category, ...edit }
}

// Session-only, per-user category list. Every user starts with zero
// categories — there is no static/default set. Not persisted anywhere yet —
// resets on reload, same as the rest of the mock data layer.
let state: {
  created: ReadonlyArray<Category>
  edits: ReadonlyMap<string, CategoryInput>
  deleted: ReadonlySet<string>
} = {
  created: [],
  edits: new Map(),
  deleted: new Set(),
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

export function useCategories(): Category[] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return snapshot.created
    .filter((category) => !snapshot.deleted.has(category.id))
    .map((category) => applyEdit(category, snapshot.edits.get(category.id)))
}

export function useCategory(id: string): Category | undefined {
  return useCategories().find((category) => category.id === id)
}

export function createCategory(input: CategoryInput): Category {
  const existingIds = new Set(state.created.map((category) => category.id))
  const base = slugify(input.name)
  let id = base
  let suffix = 2
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }

  const category: Category = { id, name: input.name, color: input.color }
  publish({ ...state, created: [...state.created, category] })
  return category
}

export function updateCategory(id: string, input: CategoryInput) {
  publish({ ...state, edits: new Map(state.edits).set(id, input) })
}

export function deleteCategory(id: string) {
  publish({ ...state, deleted: new Set(state.deleted).add(id) })
}
