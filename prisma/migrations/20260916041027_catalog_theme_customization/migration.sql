CREATE TYPE "CatalogTheme" AS ENUM ('MODERN', 'WARM', 'MINIMAL', 'BOLD');

ALTER TABLE "businesses"
  ADD COLUMN "catalogTheme" "CatalogTheme" NOT NULL DEFAULT 'MODERN',
  ADD COLUMN "catalogAccent" VARCHAR(7) NOT NULL DEFAULT '#0F766E';
