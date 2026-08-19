export const ACHIEVEMENT_IDS = [
  "first-step",
  "week-warrior",
  "consistent",
  "team-player",
  "early-riser",
  "month-master",
  "century-club",
  "perfect-week",
] as const

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export function isAchievementId(value: string): value is AchievementId {
  return (ACHIEVEMENT_IDS as ReadonlyArray<string>).includes(value)
}
