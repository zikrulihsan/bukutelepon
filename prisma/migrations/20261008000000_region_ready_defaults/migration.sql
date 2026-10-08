-- Makes a fresh database usable without running the development seed, so a
-- new region only needs `prisma migrate deploy` plus its .env. Safe to apply
-- on existing databases: nothing that already exists is overwritten.

-- Base contact categories. Earlier migrations only added the newer ones
-- (penginapan, toko-retail, ...); these came from the seed until now.
INSERT INTO "categories" ("id", "name", "slug", "icon")
VALUES
  ('10000000-0000-0000-0000-000000000101', 'Kesehatan', 'kesehatan', '🏥'),
  ('10000000-0000-0000-0000-000000000102', 'Pendidikan', 'pendidikan', '🎓'),
  ('10000000-0000-0000-0000-000000000103', 'Kuliner', 'kuliner', '🍽️'),
  ('10000000-0000-0000-0000-000000000104', 'Jasa', 'jasa', '🔧'),
  ('10000000-0000-0000-0000-000000000105', 'Pemerintah', 'pemerintah', '🏛️'),
  ('10000000-0000-0000-0000-000000000106', 'Darurat', 'darurat', '🚨'),
  ('10000000-0000-0000-0000-000000000107', 'Transportasi', 'transportasi', '🚗'),
  ('10000000-0000-0000-0000-000000000108', 'Wisata', 'wisata', '🗺️')
ON CONFLICT ("slug") DO NOTHING;

-- The seeded "Kami bantu" promotion hardcoded the original brand and admin
-- number. Switch it to the {brand}/{whatsapp} tokens the client fills from
-- the region config, but only where an admin has not edited it.
UPDATE "hero_promotions"
SET "description" = 'Ceritakan kebutuhanmu kepada tim {brand} dan kami bantu arahkan.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = '4e219840-c13b-47fd-9148-cc3bb2470104'
  AND "description" = 'Ceritakan kebutuhanmu kepada tim CariKontak dan kami bantu arahkan.';

UPDATE "hero_promotions"
SET "descriptionEn" = 'Tell the {brand} team what you need and we will point you in the right direction.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = '4e219840-c13b-47fd-9148-cc3bb2470104'
  AND "descriptionEn" = 'Tell the CariKontak team what you need and we will point you in the right direction.';

UPDATE "hero_promotions"
SET "href" = 'https://wa.me/{whatsapp}?text=Permisi%20admin%20{brand}%2C%20saya%20butuh%20bantuan%20mencari%20layanan.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = '4e219840-c13b-47fd-9148-cc3bb2470104'
  AND "href" = 'https://wa.me/6282338588078?text=Permisi%20admin%20CariKontak%2C%20saya%20butuh%20bantuan%20mencari%20layanan.';
