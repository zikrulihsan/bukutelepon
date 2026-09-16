CREATE TYPE "CatalogNavigationStyle" AS ENUM ('COMPACT_SLIDER', 'POSTER_SLIDER', 'GRID');

ALTER TABLE "businesses"
  ADD COLUMN "catalogNavigationStyle" "CatalogNavigationStyle" NOT NULL DEFAULT 'COMPACT_SLIDER';

ALTER TYPE "CatalogSectionType" ADD VALUE 'BANNER';
