-- CreateEnum
CREATE TYPE "CatalogLinkStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN "businessId" TEXT;

-- CreateTable
CREATE TABLE "catalog_link_requests" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "status" "CatalogLinkStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_link_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_businessId_key" ON "contacts"("businessId");
CREATE UNIQUE INDEX "catalog_link_requests_businessId_key" ON "catalog_link_requests"("businessId");
CREATE INDEX "catalog_link_requests_contactId_status_idx" ON "catalog_link_requests"("contactId", "status");
CREATE INDEX "catalog_link_requests_status_createdAt_idx" ON "catalog_link_requests"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "catalog_link_requests" ADD CONSTRAINT "catalog_link_requests_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "catalog_link_requests" ADD CONSTRAINT "catalog_link_requests_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Protect claim requests when accessed through Supabase's Data API.
ALTER TABLE "catalog_link_requests" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read their catalog link request"
ON "catalog_link_requests" FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Owners can create their catalog link request"
ON "catalog_link_requests" FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
  )
);

CREATE POLICY "Owners can update their catalog link request"
ON "catalog_link_requests" FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "businesses" business
    WHERE business."id" = "businessId"
      AND business."ownerId" = (SELECT auth.uid())::text
  )
);
