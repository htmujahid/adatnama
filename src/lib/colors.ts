export type PresetColor = { id: string; label: string; value: string }

export const PRESET_COLORS: ReadonlyArray<PresetColor> = [
  { id: "rose", label: "Rose", value: "#f43f5e" },
  { id: "orange", label: "Orange", value: "#f97316" },
  { id: "amber", label: "Amber", value: "#f59e0b" },
  { id: "emerald", label: "Emerald", value: "#10b981" },
  { id: "teal", label: "Teal", value: "#14b8a6" },
  { id: "sky", label: "Sky", value: "#0ea5e9" },
  { id: "indigo", label: "Indigo", value: "#6366f1" },
  { id: "violet", label: "Violet", value: "#8b5cf6" },
]
