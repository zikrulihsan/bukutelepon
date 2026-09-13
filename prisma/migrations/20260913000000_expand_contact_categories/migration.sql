INSERT INTO "categories" ("id", "name", "slug", "icon", "createdAt", "updatedAt")
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Penginapan', 'penginapan', '🏨', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000002', 'Toko & Retail', 'toko-retail', '🛍️', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000003', 'Properti', 'properti', '🏠', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000004', 'Keuangan', 'keuangan', '💳', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000005', 'Elektronik', 'elektronik', '🎧', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('10000000-0000-0000-0000-000000000006', 'Lainnya', 'lainnya', '•••', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "icon" = EXCLUDED."icon",
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "collection_versions" ("key", "version", "updatedAt")
VALUES ('categories', 1, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
  "version" = "collection_versions"."version" + 1,
  "updatedAt" = CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION bump_categories_version() RETURNS trigger AS $$
BEGIN
  UPDATE "collection_versions"
  SET "version" = "version" + 1, "updatedAt" = CURRENT_TIMESTAMP
  WHERE "key" = 'categories';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_version_bump ON "categories";
CREATE TRIGGER categories_version_bump
AFTER INSERT OR UPDATE OR DELETE ON "categories"
FOR EACH STATEMENT EXECUTE FUNCTION bump_categories_version();
