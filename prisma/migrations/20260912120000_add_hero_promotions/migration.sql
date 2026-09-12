CREATE TABLE "hero_promotions" (
  "id" TEXT NOT NULL,
  "title" VARCHAR(160) NOT NULL,
  "titleEn" VARCHAR(160),
  "highlight" VARCHAR(160),
  "highlightEn" VARCHAR(160),
  "description" VARCHAR(500) NOT NULL,
  "descriptionEn" VARCHAR(500),
  "imageUrl" VARCHAR(2048) NOT NULL,
  "href" VARCHAR(2048) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "hero_promotions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hero_promotions_isActive_sortOrder_idx"
ON "hero_promotions"("isActive", "sortOrder");

-- Prisma is the only application path to this table. RLS prevents accidental
-- exposure through Supabase's public Data API.
ALTER TABLE "hero_promotions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE "hero_promotions" FROM anon, authenticated;

INSERT INTO "hero_promotions" (
  "id", "title", "titleEn", "highlight", "highlightEn",
  "description", "descriptionEn", "imageUrl", "href",
  "isActive", "sortOrder", "updatedAt"
) VALUES
(
  '1f094d6c-7117-4a66-83df-3a95c160e101',
  'Cari kebutuhanmu', 'Find what you need', 'di {city}', 'in {city}',
  'Temukan kontak usaha, layanan, dan tempat penting di sekitarmu, lalu langsung hubungi.',
  'Find local businesses, services, and essential places around you, then get in touch right away.',
  '/hero-sumbawa-v2.webp', '/search', true, 0, CURRENT_TIMESTAMP
),
(
  '2b4bd90b-44f6-47e5-a594-a9c4016e0102',
  'Buat katalog usaha', 'Build your business catalog', 'lebih mudah ditemukan', 'and get discovered',
  'Tampilkan produk atau jasa dalam satu halaman yang mudah dibagikan lewat WhatsApp.',
  'Show products or services on one page that is easy to share through WhatsApp.',
  '/storefront/store-cover.jpg', '/buat-katalog', true, 1, CURRENT_TIMESTAMP
),
(
  '3d12a31f-ce4e-448d-b165-72ad65ec0103',
  'Butuh jasa pengiriman?', 'Need a delivery service?', 'Cari yang dekat', 'Find one nearby',
  'Temukan jasa antar barang, titip belanja, dan bantuan pengiriman di kotamu.',
  'Find couriers, personal shoppers, and delivery help in your city.',
  '/storefront/discovery-delivery.webp', '/search?q=pengiriman', true, 2, CURRENT_TIMESTAMP
),
(
  '4e219840-c13b-47fd-9148-cc3bb2470104',
  'Bingung mencari bantuan?', 'Not sure where to get help?', 'Kami bantu', 'We can help',
  'Ceritakan kebutuhanmu kepada tim CariKontak dan kami bantu arahkan.',
  'Tell the CariKontak team what you need and we will point you in the right direction.',
  '/hero-sumbawa-v2.webp',
  'https://wa.me/6282338588078?text=Permisi%20admin%20CariKontak%2C%20saya%20butuh%20bantuan%20mencari%20layanan.',
  true, 3, CURRENT_TIMESTAMP
);

-- Public images are served from stable URLs. Browser uploads are insert-only,
-- scoped to the signed-in admin's folder, and never use upsert.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Admins can upload hero images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'hero-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  AND (storage.foldername(name))[2] = 'hero'
  AND EXISTS (
    SELECT 1 FROM public.profiles profile
    WHERE profile."id" = (SELECT auth.uid())::text
      AND profile."role" = 'ADMIN'
  )
);
