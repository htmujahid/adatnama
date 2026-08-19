export interface UserTable {
  id: string
  name: string
  email: string
  emailVerified: number
  image: string | null
  createdAt: string
  updatedAt: string
  username: string | null
  displayUsername: string | null
}

export interface SessionTable {
  id: string
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  userId: string
  activeOrganizationId: string | null
}

export interface AccountTable {
  id: string
  accountId: string
  providerId: string
  userId: string
  accessToken: string | null
  refreshToken: string | null
  idToken: string | null
  accessTokenExpiresAt: string | null
  refreshTokenExpiresAt: string | null
  scope: string | null
  password: string | null
  createdAt: string
  updatedAt: string
}

export interface VerificationTable {
  id: string
  identifier: string
  value: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface OrganizationTable {
  id: string
  name: string
  slug: string
  logo: string | null
  createdAt: string
  metadata: string | null
  description: string
  color: string
  joinCode: string
}

export interface MemberTable {
  id: string
  organizationId: string
  userId: string
  role: string
  createdAt: string
}

export interface InvitationTable {
  id: string
  organizationId: string
  email: string
  role: string | null
  status: string
  expiresAt: string
  createdAt: string
  inviterId: string
}

export interface CategoryTable {
  id: string
  userId: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface HabitTable {
  id: string
  userId: string
  categoryId: string | null
  name: string
  description: string
  target: string
  reminderTime: string | null
  freezesTotal: number
  startedAt: string
  archivedAt: string | null
  archivedNote: string | null
  createdAt: string
  updatedAt: string
}

export interface HabitScheduleDayTable {
  id: string
  habitId: string
  dayOfWeek: number
}

export interface HabitCheckinTable {
  id: string
  habitId: string
  date: string
  status: string
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface UserAchievementUnlockTable {
  id: string
  userId: string
  achievementId: string
  unlockedAt: string
}

export interface UserPreferencesTable {
  userId: string
  timezone: string
  defaultSchedulePreset: string
  defaultFreezesTotal: number
  remindersEnabled: number
  weeklySummaryEnabled: number
  circleActivityEnabled: number
}

export interface PushSubscriptionTable {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  createdAt: string
}

export interface Database {
  user: UserTable
  session: SessionTable
  account: AccountTable
  verification: VerificationTable
  organization: OrganizationTable
  member: MemberTable
  invitation: InvitationTable
  category: CategoryTable
  habit: HabitTable
  habit_schedule_day: HabitScheduleDayTable
  habit_checkin: HabitCheckinTable
  user_achievement_unlock: UserAchievementUnlockTable
  user_preferences: UserPreferencesTable
  push_subscription: PushSubscriptionTable
}
