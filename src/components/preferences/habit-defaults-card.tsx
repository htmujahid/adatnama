import { useLiveQuery } from "@tanstack/react-db"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useHomeUser } from "@/hooks/use-home-user"
import { usePreferencesCollection } from "@/lib/collection/preferences"
import { useOfflineExecutor } from "@/lib/db/offline"
import { HABIT_DAY_PRESETS, schedulePresetFor } from "@/lib/habits"
import { habitDefaultsFrom, savePreferences } from "@/lib/preferences"
import type { HabitDefaults } from "@/lib/preferences"

export function HabitDefaultsCard() {
  const user = useHomeUser()
  const preferencesCollection = usePreferencesCollection()
  const executor = useOfflineExecutor()
  const { data: preferenceRows = [], isLoading } = useLiveQuery({
    query: (q) => q.from({ preferences: preferencesCollection }),
  })
  const record = preferenceRows.find((row) => row.userId === user.id)
  const habitDefaults = habitDefaultsFrom(record)

  function updateHabitDefaults(input: HabitDefaults) {
    savePreferences({
      executor,
      collection: preferencesCollection,
      userId: user.id,
      record,
      changes: {
        defaultSchedulePreset:
          schedulePresetFor(input.days) ?? HABIT_DAY_PRESETS[0].id,
        defaultFreezesTotal: input.freezesTotal,
      },
    })
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Habit defaults</CardTitle>
        <CardDescription>
          Applied automatically whenever you create a new habit.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="default-frequency">
                Default schedule
              </FieldLabel>
              <Select
                value={
                  schedulePresetFor(habitDefaults.days) ??
                  HABIT_DAY_PRESETS[0].id
                }
                onValueChange={(value) => {
                  const preset = HABIT_DAY_PRESETS.find((p) => p.id === value)
                  if (preset) {
                    updateHabitDefaults({
                      ...habitDefaults,
                      days: preset.days,
                    })
                  }
                }}
              >
                <SelectTrigger id="default-frequency" className="w-full">
                  <SelectValue>
                    {(selected: string | null) =>
                      HABIT_DAY_PRESETS.find((p) => p.id === selected)
                        ?.label ?? HABIT_DAY_PRESETS[0].label
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {HABIT_DAY_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              data-invalid={
                habitDefaults.freezesTotal < 0 || habitDefaults.freezesTotal > 5
              }
            >
              <FieldLabel htmlFor="default-freezes">Freezes</FieldLabel>
              <Input
                id="default-freezes"
                type="number"
                min={0}
                max={5}
                value={habitDefaults.freezesTotal}
                onChange={(event) =>
                  updateHabitDefaults({
                    ...habitDefaults,
                    freezesTotal: Number(event.target.value),
                  })
                }
              />
            </Field>
          </>
        )}
      </CardContent>
    </Card>
  )
}
