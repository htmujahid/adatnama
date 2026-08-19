CREATE TABLE "push_subscription" (
  "id"        text NOT NULL PRIMARY KEY,
  "userId"    text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "endpoint"  text NOT NULL UNIQUE,
  "p256dh"    text NOT NULL,
  "auth"      text NOT NULL,
  "createdAt" text NOT NULL
);

CREATE INDEX "push_subscription_userId_idx" ON "push_subscription" ("userId");
