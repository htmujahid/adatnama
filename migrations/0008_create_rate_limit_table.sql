CREATE TABLE "rateLimit" (
  "id"          text NOT NULL PRIMARY KEY,
  "key"         text NOT NULL UNIQUE,
  "count"       integer NOT NULL,
  "lastRequest" integer NOT NULL
);
