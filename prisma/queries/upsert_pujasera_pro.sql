-- Data awal Katalog Pro PUJASERA.
-- Jalankan melalui Supabase SQL Editor setelah akun klien selesai didaftarkan.
-- Ganti hanya nilai v_owner_email di bawah ini.
--
-- Query ini aman dijalankan ulang:
--   * akun dinaikkan ke paket PRO;
--   * profil bisnis di-upsert berdasarkan ownerId;
--   * layanan di-upsert berdasarkan businessId + slug;
--   * foto yang sudah diunggah tidak ditimpa saat query dijalankan ulang.
--
-- Etalase baru sengaja dibuat sebagai DRAFT agar logo, sampul, foto layanan,
-- lokasi yang akurat, dan jam operasional dapat diperiksa sebelum diterbitkan.

DO $seed$
DECLARE
  v_owner_email  TEXT := 'GANTI_DENGAN_EMAIL_AKUN_KLIEN';
  v_owner_id     TEXT;
  v_business_id  TEXT;
  v_existing_slug TEXT;
BEGIN
  IF v_owner_email = 'GANTI_DENGAN_EMAIL_AKUN_KLIEN' THEN
    RAISE EXCEPTION 'Ganti v_owner_email dengan email akun PUJASERA terlebih dahulu.';
  END IF;

  SELECT "id"
  INTO v_owner_id
  FROM "profiles"
  WHERE LOWER("email") = LOWER(v_owner_email);

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Profil dengan email % tidak ditemukan. Daftarkan akun klien terlebih dahulu.', v_owner_email;
  END IF;

  SELECT "slug"
  INTO v_existing_slug
  FROM "businesses"
  WHERE "ownerId" = v_owner_id;

  IF v_existing_slug IS NOT NULL AND v_existing_slug <> 'pujasera' THEN
    RAISE EXCEPTION
      'Akun % sudah memiliki etalase dengan slug %. Query dihentikan agar data lama tidak tertimpa.',
      v_owner_email,
      v_existing_slug;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM "businesses"
    WHERE "slug" = 'pujasera'
      AND "ownerId" <> v_owner_id
  ) THEN
    RAISE EXCEPTION 'Slug pujasera sudah digunakan oleh akun lain.';
  END IF;

  UPDATE "profiles"
  SET
    "plan" = 'PRO'::"AccountPlan",
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE "id" = v_owner_id;

  INSERT INTO "businesses" (
    "id",
    "ownerId",
    "name",
    "slug",
    "description",
    "whatsapp",
    "alternateWhatsapp",
    "instagram",
    "address",
    "openingHours",
    "status",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    gen_random_uuid()::TEXT,
    v_owner_id,
    'PUJASERA',
    'pujasera',
    'Pusat jasa layanan di Sumbawa Besar untuk jastip, antar-jemput sekolah, perjalanan dalam kota, pengiriman barang, dan jasa kebersihan SIBERSIH.',
    '6285137833632',
    '6285189209913',
    'pujasera.service',
    'Sumbawa Besar, Nusa Tenggara Barat',
    'Konfirmasi jadwal melalui WhatsApp',
    'DRAFT'::"BusinessStatus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT ("ownerId") DO UPDATE
  SET
    "name" = EXCLUDED."name",
    "slug" = EXCLUDED."slug",
    "description" = EXCLUDED."description",
    "whatsapp" = EXCLUDED."whatsapp",
    "alternateWhatsapp" = EXCLUDED."alternateWhatsapp",
    "instagram" = EXCLUDED."instagram",
    "address" = EXCLUDED."address",
    "openingHours" = EXCLUDED."openingHours",
    "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id" INTO v_business_id;

  INSERT INTO "storefront_items" (
    "id",
    "businessId",
    "type",
    "name",
    "slug",
    "shortDescription",
    "description",
    "category",
    "price",
    "priceType",
    "unit",
    "badge",
    "status",
    "sortOrder",
    "createdAt",
    "updatedAt"
  )
  SELECT
    gen_random_uuid()::TEXT,
    v_business_id,
    seed."type",
    seed."name",
    seed."slug",
    seed."shortDescription",
    seed."description",
    seed."category",
    seed."price",
    seed."priceType",
    seed."unit",
    seed."badge",
    seed."status",
    seed."sortOrder",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  FROM (
    VALUES
      (
        'SERVICE'::"StorefrontItemType",
        'Jastip',
        'jastip',
        'Titip belanja dan kirim dengan proses yang aman, cepat, dan terpercaya.',
        'Layanan titip belanja dan pengiriman untuk membantu kebutuhan harian. Hubungi PUJASERA melalui WhatsApp untuk menyampaikan daftar belanja, lokasi, tujuan pengiriman, dan memperoleh konfirmasi biaya.',
        'Jastip',
        0,
        'CONTACT'::"StorefrontPriceType",
        'pesanan',
        'Aman & Terpercaya',
        'ACTIVE'::"StorefrontItemStatus",
        10
      ),
      (
        'SERVICE'::"StorefrontItemType",
        'Antar-Jemput Sekolah',
        'antar-jemput-sekolah',
        'Layanan antar-jemput anak sekolah yang aman dan tepat waktu.',
        'Layanan antar-jemput sekolah dengan pengemudi berpengalaman, rute terjadwal, dan prioritas pada keselamatan anak. Konsultasikan sekolah, area penjemputan, jadwal, dan ketersediaan melalui WhatsApp.',
        'Transportasi',
        0,
        'CONTACT'::"StorefrontPriceType",
        'perjalanan',
        'Aman & Tepat Waktu',
        'ACTIVE'::"StorefrontItemStatus",
        20
      ),
      (
        'SERVICE'::"StorefrontItemType",
        'Ride & Drive',
        'ride-and-drive',
        'Layanan perjalanan dalam kota untuk kebutuhan mobilitas Anda.',
        'Layanan perjalanan dalam kota melalui PUJASERA. Sampaikan lokasi penjemputan, tujuan, waktu perjalanan, dan jumlah penumpang melalui WhatsApp untuk memperoleh konfirmasi.',
        'Transportasi',
        0,
        'CONTACT'::"StorefrontPriceType",
        'perjalanan',
        'Dalam Kota',
        'ACTIVE'::"StorefrontItemStatus",
        30
      ),
      (
        'SERVICE'::"StorefrontItemType",
        'Express',
        'express',
        'Layanan kirim barang lebih cepat di area Sumbawa Besar.',
        'Layanan pengiriman barang yang cepat, rapi, dan terpercaya. Sampaikan jenis barang, lokasi pengambilan, alamat tujuan, dan waktu pengiriman melalui WhatsApp.',
        'Kurir',
        0,
        'CONTACT'::"StorefrontPriceType",
        'pengiriman',
        'Cepat',
        'ACTIVE'::"StorefrontItemStatus",
        40
      ),
      (
        'SERVICE'::"StorefrontItemType",
        'SIBERSIH',
        'sibersih',
        'Jasa kebersihan profesional untuk rumah, kantor, ruko, gudang, dan bangunan lainnya.',
        'Solusi jasa kebersihan dengan tenaga kerja berpengalaman, peralatan lengkap, serta standar pelayanan yang rapi, bersih, dan terpercaya. Melayani rumah tinggal, kantor dan instansi, ruko dan toko, gudang, kos dan kontrakan, apartemen, bangunan baru atau pasca-renovasi, serta jenis bangunan lainnya. Harga menyesuaikan luas area, tingkat kotoran, serta lokasi pekerjaan. Survei tersedia untuk pekerjaan berskala besar. Biaya transportasi dapat berlaku untuk area tertentu. Layanan tersedia harian, mingguan, bulanan, maupun berdasarkan proyek.',
        'Kebersihan',
        0,
        'CONTACT'::"StorefrontPriceType",
        'sesi',
        'Konsultasi Gratis',
        'ACTIVE'::"StorefrontItemStatus",
        50
      )
  ) AS seed(
    "type",
    "name",
    "slug",
    "shortDescription",
    "description",
    "category",
    "price",
    "priceType",
    "unit",
    "badge",
    "status",
    "sortOrder"
  )
  ON CONFLICT ("businessId", "slug") DO UPDATE
  SET
    "type" = EXCLUDED."type",
    "name" = EXCLUDED."name",
    "shortDescription" = EXCLUDED."shortDescription",
    "description" = EXCLUDED."description",
    "category" = EXCLUDED."category",
    "price" = EXCLUDED."price",
    "priceType" = EXCLUDED."priceType",
    "unit" = EXCLUDED."unit",
    "badge" = EXCLUDED."badge",
    "status" = EXCLUDED."status",
    "sortOrder" = EXCLUDED."sortOrder",
    "updatedAt" = CURRENT_TIMESTAMP;
END;
$seed$;

-- Verifikasi hasil. Etalase baru tetap DRAFT sampai diterbitkan dari dasbor Pro;
-- jika etalase sudah ada, status publikasinya dipertahankan.
SELECT
  profile."email",
  profile."plan",
  business."name",
  business."slug",
  business."status",
  COUNT(item."id") AS "jumlahItem"
FROM "profiles" profile
JOIN "businesses" business ON business."ownerId" = profile."id"
LEFT JOIN "storefront_items" item ON item."businessId" = business."id"
WHERE business."slug" = 'pujasera'
GROUP BY
  profile."email",
  profile."plan",
  business."name",
  business."slug",
  business."status";
