-- Track only the latest public-facing change for each contact. Keeping a
-- compact outbox avoids an ever-growing event log while still allowing any
-- client version to converge on the current public collection.
CREATE TABLE "contact_sync_entries" (
    "contactId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "operation" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_sync_entries_pkey" PRIMARY KEY ("contactId"),
    CONSTRAINT "contact_sync_entries_operation_check"
      CHECK ("operation" IN ('UPSERT', 'DELETE'))
);

CREATE INDEX "contact_sync_entries_revision_contactId_idx"
ON "contact_sync_entries"("revision", "contactId");

INSERT INTO "collection_versions" ("key", "version", "updatedAt")
VALUES ('contacts', 1, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Backfill one authoritative UPSERT entry for every currently public contact.
-- They may share a revision; pagination also uses contactId as a stable tie-breaker.
INSERT INTO "contact_sync_entries" ("contactId", "revision", "operation", "changedAt")
SELECT
  c."id",
  COALESCE(v."version", 1),
  'UPSERT',
  CURRENT_TIMESTAMP
FROM "contacts" c
LEFT JOIN "collection_versions" v ON v."key" = 'contacts'
WHERE c."status" = 'APPROVED';

-- Replace the old statement-level version bump with a row-level public outbox.
DROP TRIGGER IF EXISTS contacts_version_bump ON "contacts";
DROP FUNCTION IF EXISTS bump_contacts_version();

CREATE OR REPLACE FUNCTION record_contact_sync_change() RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  next_revision INTEGER;
  changed_contact_id TEXT;
  sync_operation TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD."status" <> 'APPROVED' THEN
      RETURN OLD;
    END IF;
    changed_contact_id := OLD."id";
    sync_operation := 'DELETE';
  ELSIF NEW."status" = 'APPROVED' THEN
    changed_contact_id := NEW."id";
    sync_operation := 'UPSERT';
  ELSIF TG_OP = 'UPDATE' AND OLD."status" = 'APPROVED' THEN
    changed_contact_id := OLD."id";
    sync_operation := 'DELETE';
  ELSE
    RETURN NEW;
  END IF;

  UPDATE "collection_versions"
  SET "version" = "version" + 1, "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'contacts'
  RETURNING "version" INTO next_revision;

  -- Be defensive if an older environment is missing the seeded version row.
  IF next_revision IS NULL THEN
    INSERT INTO "collection_versions" ("key", "version", "updatedAt")
    VALUES ('contacts', 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE
      SET "version" = "collection_versions"."version" + 1,
          "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "version" INTO next_revision;
  END IF;

  INSERT INTO "contact_sync_entries" ("contactId", "revision", "operation", "changedAt")
  VALUES (changed_contact_id, next_revision, sync_operation, CURRENT_TIMESTAMP)
  ON CONFLICT ("contactId") DO UPDATE
  SET "revision" = EXCLUDED."revision",
      "operation" = EXCLUDED."operation",
      "changedAt" = EXCLUDED."changedAt";

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER contacts_sync_change
AFTER INSERT OR UPDATE OR DELETE ON "contacts"
FOR EACH ROW EXECUTE FUNCTION record_contact_sync_change();

-- This table and trigger function are server-internal. RLS plus explicit
-- privilege revocation prevents accidental exposure through Supabase Data API.
ALTER TABLE "contact_sync_entries" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "contact_sync_entries" FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION record_contact_sync_change() FROM PUBLIC;
