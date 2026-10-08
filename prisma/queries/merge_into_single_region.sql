-- Satukan database lama (multi-kota) menjadi satu wilayah.
--
-- Aplikasi kini hanya menampilkan kota yang diatur di VITE_REGION_SLUG.
-- Kontak yang tercatat di kota lain tidak akan muncul. Jalankan query ini
-- lewat Supabase SQL Editor jika database lama masih memiliki kota lain.
--
-- LANGKAH 1 — Lihat dulu (aman, hanya membaca):
--
--   SELECT c."slug", c."name", COUNT(ct."id") AS jumlah_kontak
--   FROM "cities" c
--   LEFT JOIN "contacts" ct ON ct."cityId" = c."id"
--   GROUP BY c."id"
--   ORDER BY jumlah_kontak DESC;
--
-- LANGKAH 2 — Ganti v_region_slug di bawah, lalu jalankan blok ini. Semua
-- kontak dipindahkan ke kota wilayah, lalu kota lain yang sudah kosong
-- dihapus. Hapus kontak yang memang bukan milik wilayah ini sebelum
-- menjalankannya jika tidak ingin ikut dipindahkan.

DO $merge$
DECLARE
  v_region_slug TEXT := 'GANTI_DENGAN_SLUG_WILAYAH'; -- contoh: 'sumbawa-besar'
  v_region_id   TEXT;
  v_moved       INTEGER;
  v_deleted     INTEGER;
BEGIN
  IF v_region_slug = 'GANTI_DENGAN_SLUG_WILAYAH' THEN
    RAISE EXCEPTION 'Ganti v_region_slug dengan nilai VITE_REGION_SLUG terlebih dahulu.';
  END IF;

  SELECT "id" INTO v_region_id FROM "cities" WHERE "slug" = v_region_slug;
  IF v_region_id IS NULL THEN
    RAISE EXCEPTION 'Kota dengan slug % belum ada. Buka /api/cities sekali agar dibuat otomatis.', v_region_slug;
  END IF;

  UPDATE "contacts" SET "cityId" = v_region_id WHERE "cityId" <> v_region_id;
  GET DIAGNOSTICS v_moved = ROW_COUNT;

  DELETE FROM "cities" c
  WHERE c."id" <> v_region_id
    AND NOT EXISTS (SELECT 1 FROM "contacts" ct WHERE ct."cityId" = c."id");
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RAISE NOTICE '% kontak dipindahkan, % kota dihapus.', v_moved, v_deleted;
END
$merge$;
