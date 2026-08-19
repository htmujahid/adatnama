CREATE TABLE "user_preferences" (
  "userId"                text NOT NULL PRIMARY KEY REFERENCES "user" ("id") ON DELETE CASCADE,
  "defaultSchedulePreset" text NOT NULL,
  "defaultFreezesTotal"   integer NOT NULL,
  "remindersEnabled"      integer NOT NULL,
  "weeklySummaryEnabled"  integer NOT NULL,
  "circleActivityEnabled" integer NOT NULL
);
