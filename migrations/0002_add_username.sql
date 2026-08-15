ALTER TABLE "user" ADD COLUMN "username" text;
ALTER TABLE "user" ADD COLUMN "displayUsername" text;

CREATE UNIQUE INDEX "user_username_unique" ON "user" ("username");
