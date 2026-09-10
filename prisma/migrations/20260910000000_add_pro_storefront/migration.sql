-- CreateEnum
CREATE TYPE "AccountPlan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "StorefrontItemType" AS ENUM ('PRODUCT', 'SERVICE', 'PACKAGE', 'PROMO');

-- CreateEnum
CREATE TYPE "StorefrontPriceType" AS ENUM ('FIXED', 'STARTING_FROM', 'CONTACT', 'FREE');

-- CreateEnum
CREATE TYPE "StorefrontItemStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'SOLD_OUT');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "plan" "AccountPlan" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "alternateWhatsapp" TEXT,
    "instagram" TEXT,
    "address" VARCHAR(500),
    "mapsUrl" TEXT,
    "openingHours" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "status" "BusinessStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storefront_items" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "StorefrontItemType" NOT NULL DEFAULT 'PRODUCT',
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" VARCHAR(240) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "priceType" "StorefrontPriceType" NOT NULL DEFAULT 'CONTACT',
    "unit" TEXT,
    "imageUrl" TEXT,
    "badge" TEXT,
    "status" "StorefrontItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_ownerId_key" ON "businesses"("ownerId");
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");
CREATE INDEX "businesses_status_idx" ON "businesses"("status");
CREATE UNIQUE INDEX "storefront_items_businessId_slug_key" ON "storefront_items"("businessId", "slug");
CREATE INDEX "storefront_items_businessId_status_sortOrder_idx" ON "storefront_items"("businessId", "status", "sortOrder");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storefront_items" ADD CONSTRAINT "storefront_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Protect storefront tables even if they are queried through Supabase's Data API.
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "storefront_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published businesses are public"
ON "businesses" FOR SELECT
USING ("status" = 'ACTIVE');

CREATE POLICY "Owners can read their business"
ON "businesses" FOR SELECT TO authenticated
USING ((SELECT auth.uid())::text = "ownerId");

CREATE POLICY "Pro owners can insert their business"
ON "businesses" FOR INSERT TO authenticated
WITH CHECK (
  (SELECT auth.uid())::text = "ownerId"
  AND EXISTS (
    SELECT 1 FROM "profiles" profile
    WHERE profile."id" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Pro owners can update their business"
ON "businesses" FOR UPDATE TO authenticated
USING (
  (SELECT auth.uid())::text = "ownerId"
  AND EXISTS (
    SELECT 1 FROM "profiles" profile
    WHERE profile."id" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
)
WITH CHECK (
  (SELECT auth.uid())::text = "ownerId"
  AND EXISTS (
    SELECT 1 FROM "profiles" profile
    WHERE profile."id" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Pro owners can delete their business"
ON "businesses" FOR DELETE TO authenticated
USING (
  (SELECT auth.uid())::text = "ownerId"
  AND EXISTS (
    SELECT 1 FROM "profiles" profile
    WHERE profile."id" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Published storefront items are public"
ON "storefront_items" FOR SELECT
USING (
  "status" <> 'HIDDEN'
  AND EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "storefront_items"."businessId"
      AND business."status" = 'ACTIVE'
  )
);

CREATE POLICY "Owners can read their storefront items"
ON "storefront_items" FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "storefront_items"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Pro owners can insert storefront items"
ON "storefront_items" FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "storefront_items"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Pro owners can update storefront items"
ON "storefront_items" FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "storefront_items"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "storefront_items"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

CREATE POLICY "Pro owners can delete storefront items"
ON "storefront_items" FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    JOIN "profiles" profile ON profile."id" = business."ownerId"
    WHERE business."id" = "storefront_items"."businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);

-- A public bucket is intentional: published catalog images need stable public URLs.
-- Public buckets handle reads without a SELECT policy. Browser writes are upload-only;
-- replacement/deletion is performed by the API after it verifies record ownership.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'catalog-images',
  'catalog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Pro users can upload catalog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'catalog-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM public.profiles profile
    WHERE profile."id" = (SELECT auth.uid())::text
      AND (profile."plan" = 'PRO' OR profile."role" = 'ADMIN')
  )
);
