-- Users, multi-tenant journal entries, AuthProvider enum, soft delete

CREATE TYPE "AuthProvider" AS ENUM ('cognito');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth_provider" "AuthProvider" NOT NULL,
    "external_user_id" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_auth_provider_external_user_id_key"
  ON "users"("auth_provider", "external_user_id");

CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

INSERT INTO "users" ("id", "auth_provider", "external_user_id", "email", "created_at")
VALUES (
  'eval-system-user',
  'cognito',
  'eval-system-sub',
  'eval@memrider.local',
  CURRENT_TIMESTAMP
);

ALTER TABLE "journal_entries" ADD COLUMN "user_id" TEXT;

UPDATE "journal_entries"
SET "user_id" = 'eval-system-user'
WHERE "user_id" IS NULL;

ALTER TABLE "journal_entries" ALTER COLUMN "user_id" SET NOT NULL;

CREATE INDEX "journal_entries_user_id_idx" ON "journal_entries"("user_id");

ALTER TABLE "journal_entries"
  ADD CONSTRAINT "journal_entries_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
