CREATE TABLE "user_achievement_unlock" (
  "id"            text NOT NULL PRIMARY KEY,
  "userId"        text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "achievementId" text NOT NULL,
  "unlockedAt"    date NOT NULL
);

CREATE UNIQUE INDEX "user_achievement_unlock_userId_achievementId_idx" ON "user_achievement_unlock" ("userId", "achievementId");
