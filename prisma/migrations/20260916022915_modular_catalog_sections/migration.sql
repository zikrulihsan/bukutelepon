CREATE TYPE "CatalogPreset" AS ENUM ('RESTAURANT', 'SERVICE', 'RETAIL', 'ACTIVITY');
CREATE TYPE "CatalogLayout" AS ENUM ('ROW', 'CARD');
CREATE TYPE "CatalogSectionType" AS ENUM ('ITEM_GROUP', 'PROMOTION', 'ACTIVITY', 'INFORMATION');
CREATE TYPE "CatalogSectionStatus" AS ENUM ('ACTIVE', 'HIDDEN');

ALTER TABLE "businesses"
  ADD COLUMN "catalogPreset" "CatalogPreset" NOT NULL DEFAULT 'RETAIL',
  ADD COLUMN "defaultItemLayout" "CatalogLayout" NOT NULL DEFAULT 'CARD';

CREATE TABLE "catalog_sections" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "type" "CatalogSectionType" NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "subtitle" VARCHAR(500),
  "category" VARCHAR(80),
  "layout" "CatalogLayout" NOT NULL DEFAULT 'CARD',
  "imageUrl" TEXT,
  "badge" VARCHAR(40),
  "ctaLabel" VARCHAR(80),
  "ctaUrl" VARCHAR(1000),
  "scheduleLabel" VARCHAR(120),
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "status" "CatalogSectionStatus" NOT NULL DEFAULT 'ACTIVE',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "catalog_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "catalog_sections_businessId_status_sortOrder_idx"
ON "catalog_sections"("businessId", "status", "sortOrder");

ALTER TABLE "catalog_sections"
ADD CONSTRAINT "catalog_sections_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "catalog_sections" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published catalog sections are public"
ON "catalog_sections" FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "catalog_sections"."businessId"
      AND business."status" = 'ACTIVE'
  )
  OR EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "catalog_sections"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Pro owners can insert catalog sections"
ON "catalog_sections" FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "catalog_sections"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Pro owners can update catalog sections"
ON "catalog_sections" FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "catalog_sections"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "catalog_sections"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Pro owners can delete catalog sections"
ON "catalog_sections" FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "catalog_sections"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);
