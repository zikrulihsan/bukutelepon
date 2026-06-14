-- CreateTable
CREATE TABLE "collection_versions" (
    "key" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_versions_pkey" PRIMARY KEY ("key")
);

-- Seed the contacts collection version
INSERT INTO "collection_versions" ("key", "version", "updatedAt")
VALUES ('contacts', 1, CURRENT_TIMESTAMP);

-- Trigger function: bump the contacts collection version on any change to contacts
CREATE OR REPLACE FUNCTION bump_contacts_version() RETURNS trigger AS $$
BEGIN
    UPDATE "collection_versions"
    SET "version" = "version" + 1, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "key" = 'contacts';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Statement-level trigger: one bump per statement (a 50-row bulk insert = one bump)
CREATE TRIGGER contacts_version_bump
AFTER INSERT OR UPDATE OR DELETE ON "contacts"
FOR EACH STATEMENT EXECUTE FUNCTION bump_contacts_version();
