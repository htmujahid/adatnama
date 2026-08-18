CREATE TABLE "user_preferences" (
  "userId"                text NOT NULL PRIMARY KEY REFERENCES "user" ("id") ON DELETE CASCADE,
  "timezone"              text NOT NULL,
  "defaultCategoryId"     text REFERENCES "category" ("id") ON DELETE SET NULL,
  "defaultSchedulePreset" text NOT NULL,
  "defaultFreezesTotal"   integer NOT NULL,
  "remindersEnabled"      integer NOT NULL,
  "weeklySummaryEnabled"  integer NOT NULL,
  "circleActivityEnabled" integer NOT NULL
);

CREATE INDEX "user_preferences_defaultCategoryId_idx" ON "user_preferences" ("defaultCategoryId");
