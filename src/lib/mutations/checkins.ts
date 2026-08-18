import { NonRetriableError } from "@tanstack/offline-transactions"
import type { OfflineConfig } from "@tanstack/offline-transactions"

import { deleteCheckin, upsertCheckin } from "@/actions/checkins"
import type { CheckinRecord, checkinsCollection  } from "@/lib/collection/checkins"

type CheckinsCollection = typeof checkinsCollection

async function upsertFromMutation(mutation: {
  collection: unknown
  modified: unknown
}) {
  const collection = mutation.collection as CheckinsCollection
  const modified = mutation.modified as CheckinRecord
  const result = await upsertCheckin({
    data: {
      id: modified.id,
      habitId: modified.habitId,
      date: modified.date,
      status: modified.status,
      note: modified.note,
    },
  })
  if (result.error || !result.checkin) {
    throw new NonRetriableError(result.error?.message ?? "Check-in failed.")
  }
  collection.utils.writeUpsert(result.checkin)
}

export const checkinMutationFns: OfflineConfig["mutationFns"] = {
  "checkins.create": async ({ transaction }) => {
    await upsertFromMutation(transaction.mutations[0])
  },
  "checkins.update": async ({ transaction }) => {
    await upsertFromMutation(transaction.mutations[0])
  },
  "checkins.delete": async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    const collection = mutation.collection as unknown as CheckinsCollection
    const result = await deleteCheckin({
      data: { id: String(mutation.key) },
    })
    if (result.error) {
      throw new NonRetriableError(result.error.message)
    }
    collection.utils.writeDelete(String(mutation.key))
  },
}
