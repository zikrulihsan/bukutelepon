-- Brings a database created from the init migration up to the schema the
-- later migrations (and schema.prisma) expect. The original database was
-- moved forward outside of migrations, so a fresh database built from this
-- folder used to fail at 20260913000000_expand_contact_categories.
--
-- Every statement is guarded: on a database that already has the current
-- columns (such as the original production database, where this migration
-- runs after all the others) it changes nothing. Nothing is dropped; legacy
-- columns only lose their NOT NULL constraint so Prisma inserts succeed.

DO $align$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrustLevel') THEN
    CREATE TYPE "TrustLevel" AS ENUM ('UNVERIFIED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'ID_VERIFIED');
  END IF;

  -- Renamed columns
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'contacts' AND column_name = 'businessName')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'contacts' AND column_name = 'name') THEN
    ALTER TABLE "contacts" RENAME COLUMN "businessName" TO "name";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'profiles' AND column_name = 'fullName')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'profiles' AND column_name = 'name') THEN
    ALTER TABLE "profiles" RENAME COLUMN "fullName" TO "name";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'contacts' AND column_name = 'description' AND data_type = 'text') THEN
    ALTER TABLE "contacts" ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'reviews' AND column_name = 'comment' AND data_type = 'text') THEN
    ALTER TABLE "reviews" ALTER COLUMN "comment" SET DATA TYPE VARCHAR(500);
  END IF;
END
$align$;

-- Columns added to the schema after init
ALTER TABLE "contacts"
  ADD COLUMN IF NOT EXISTS "mapsUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "claimedById" TEXT;

ALTER TABLE "profiles"
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "trustLevel" "TrustLevel" NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS "contributedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "reviews"
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

ALTER TABLE "guest_sessions"
  ADD COLUMN IF NOT EXISTS "sessionToken" TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP(3) NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "profiles_phone_key" ON "profiles"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "guest_sessions_sessionToken_key" ON "guest_sessions"("sessionToken");

DO $align$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_claimedById_fkey') THEN
    ALTER TABLE "contacts" ADD CONSTRAINT "contacts_claimedById_fkey"
      FOREIGN KEY ("claimedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- Legacy columns the schema no longer writes
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'cities' AND column_name = 'updatedAt' AND is_nullable = 'NO') THEN
    ALTER TABLE "cities" ALTER COLUMN "updatedAt" DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'categories' AND column_name = 'updatedAt' AND is_nullable = 'NO') THEN
    ALTER TABLE "categories" ALTER COLUMN "updatedAt" DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'guest_sessions' AND column_name = 'updatedAt' AND is_nullable = 'NO') THEN
    ALTER TABLE "guest_sessions" ALTER COLUMN "updatedAt" DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'guest_sessions' AND column_name = 'fingerprint' AND is_nullable = 'NO') THEN
    ALTER TABLE "guest_sessions" ALTER COLUMN "fingerprint" DROP NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'guest_sessions' AND column_name = 'viewedContactIds' AND is_nullable = 'NO') THEN
    ALTER TABLE "guest_sessions" ALTER COLUMN "viewedContactIds" DROP NOT NULL;
  END IF;
END
$align$;
