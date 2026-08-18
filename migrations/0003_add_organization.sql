ALTER TABLE "session" ADD COLUMN "activeOrganizationId" text;

CREATE TABLE "organization" (
  "id"          text NOT NULL PRIMARY KEY,
  "name"        text NOT NULL,
  "slug"        text NOT NULL UNIQUE,
  "logo"        text,
  "createdAt"   date NOT NULL,
  "metadata"    text,
  "description" text NOT NULL,
  "color"       text NOT NULL,
  "joinCode"    text NOT NULL UNIQUE
);

CREATE INDEX "organization_slug_idx" ON "organization" ("slug");

CREATE TABLE "member" (
  "id"             text NOT NULL PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
  "userId"         text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "role"           text NOT NULL,
  "createdAt"      date NOT NULL
);

CREATE INDEX "member_organizationId_idx" ON "member" ("organizationId");
CREATE INDEX "member_userId_idx" ON "member" ("userId");

CREATE TABLE "invitation" (
  "id"             text NOT NULL PRIMARY KEY,
  "organizationId" text NOT NULL REFERENCES "organization" ("id") ON DELETE CASCADE,
  "email"          text NOT NULL,
  "role"           text,
  "status"         text NOT NULL,
  "expiresAt"      date NOT NULL,
  "createdAt"      date NOT NULL,
  "inviterId"      text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organizationId");
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");
