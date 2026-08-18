CREATE TABLE "category" (
  "id"        text NOT NULL PRIMARY KEY,
  "userId"    text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "name"      text NOT NULL,
  "color"     text NOT NULL,
  "createdAt" date NOT NULL,
  "updatedAt" date NOT NULL
);

CREATE INDEX "category_userId_idx" ON "category" ("userId");

CREATE TABLE "habit" (
  "id"           text NOT NULL PRIMARY KEY,
  "userId"       text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "categoryId"   text REFERENCES "category" ("id") ON DELETE SET NULL,
  "name"         text NOT NULL,
  "description"  text NOT NULL,
  "target"       text NOT NULL,
  "reminderTime" text,
  "freezesTotal" integer NOT NULL,
  "startedAt"    date NOT NULL,
  "archivedAt"   date,
  "archivedNote" text,
  "createdAt"    date NOT NULL,
  "updatedAt"    date NOT NULL
);

CREATE INDEX "habit_userId_idx" ON "habit" ("userId");
CREATE INDEX "habit_categoryId_idx" ON "habit" ("categoryId");

CREATE TABLE "habit_schedule_day" (
  "id"        text NOT NULL PRIMARY KEY,
  "habitId"   text NOT NULL REFERENCES "habit" ("id") ON DELETE CASCADE,
  "dayOfWeek" integer NOT NULL
);

CREATE UNIQUE INDEX "habit_schedule_day_habitId_dayOfWeek_idx" ON "habit_schedule_day" ("habitId", "dayOfWeek");

CREATE TABLE "habit_checkin" (
  "id"        text NOT NULL PRIMARY KEY,
  "habitId"   text NOT NULL REFERENCES "habit" ("id") ON DELETE CASCADE,
  "date"      text NOT NULL,
  "status"    text NOT NULL,
  "note"      text,
  "createdAt" date NOT NULL,
  "updatedAt" date NOT NULL
);

CREATE UNIQUE INDEX "habit_checkin_habitId_date_idx" ON "habit_checkin" ("habitId", "date");
