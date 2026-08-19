CREATE TABLE "user_preferences" (
  "userId"                text NOT NULL PRIMARY KEY REFERENCES "user" ("id") ON DELETE CASCADE,
  "defaultSchedulePreset" text NOT NULL,
  "defaultFreezesTotal"   integer NOT NULL
);
