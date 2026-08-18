CREATE TABLE "achievement" (
  "id"          text NOT NULL PRIMARY KEY,
  "name"        text NOT NULL,
  "description" text NOT NULL,
  "icon"        text NOT NULL,
  "target"      integer,
  "createdAt"   date NOT NULL
);

CREATE TABLE "user_achievement_unlock" (
  "id"            text NOT NULL PRIMARY KEY,
  "userId"        text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "achievementId" text NOT NULL REFERENCES "achievement" ("id") ON DELETE CASCADE,
  "unlockedAt"    date NOT NULL
);

CREATE UNIQUE INDEX "user_achievement_unlock_userId_achievementId_idx" ON "user_achievement_unlock" ("userId", "achievementId");
CREATE INDEX "user_achievement_unlock_achievementId_idx" ON "user_achievement_unlock" ("achievementId");
