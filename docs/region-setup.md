# Membuat Instance untuk Daerahmu

Aplikasi ini dirancang **satu deployment = satu kota/wilayah**, dengan database
sendiri. Daerah lain yang ingin membuat direktori serupa cukup menyalin
repository ini, mengisi konfigurasi wilayah, lalu deploy. Nama aplikasi, kota,
nomor admin, dan isi lainnya sepenuhnya milik daerah masing-masing.

## Gambaran singkat

| Bagian | Sumber | Keterangan |
| --- | --- | --- |
| Nama aplikasi, tagline, domain, warna | `VITE_APP_*`, `VITE_THEME_COLOR` | Dipakai di UI, judul tab, PWA, dan preview link |
| Kota yang dilayani | `VITE_REGION_NAME`, `VITE_REGION_SLUG`, `VITE_REGION_PROVINCE` | Dibaca client **dan** server; baris kota dibuat otomatis |
| Nomor WhatsApp admin | `VITE_ADMIN_WHATSAPP` | Tombol bantuan, jastip kontak, dan paket katalog |
| Skema & data awal database | `prisma/migrations/` | Tabel, kategori default, bucket Storage, kebijakan RLS |
| Logo, ikon, foto | `client/public/` | Ganti file dengan aset daerahmu |

Tidak ada pemilih kota di aplikasi. Semua kontak yang dikirim warga maupun
admin otomatis tercatat di kota wilayah tersebut.

## 1. Salin repository

Fork atau clone repository ini ke akun/organisasimu sendiri.

```bash
git clone https://github.com/<akunmu>/<nama-repo>.git
cd <nama-repo>
```

## 2. Siapkan Supabase (database terpisah)

1. Buat project baru di [Supabase](https://supabase.com/) khusus untuk daerahmu.
2. Catat: Project URL, `anon`/publishable key, `service_role` key, connection
   string pooler (`DATABASE_URL`, tambahkan `?pgbouncer=true`) dan direct
   connection (`DIRECT_URL`).
3. Di **Authentication → URL Configuration**, set Site URL ke domainmu dan
   tambahkan `https://domainmu/reset-password` ke Redirect URLs.

## 3. Isi konfigurasi

```bash
cp .env.example .env
```

Isi kredensial Supabase, lalu bagian wilayah. Contoh untuk Kota Bima:

```env
VITE_APP_NAME=Kontak Bima
VITE_APP_TAGLINE=Kontak Penting Warga Bima
VITE_APP_DESCRIPTION=Temukan dan bagikan kontak penting di Kota Bima.
VITE_APP_URL=https://kontakbima.id
VITE_THEME_COLOR=#0d3b2e
VITE_REGION_NAME=Kota Bima
VITE_REGION_SLUG=kota-bima
VITE_REGION_PROVINCE=Nusa Tenggara Barat
VITE_ADMIN_WHATSAPP=6281234567890
```

Catatan:

- `VITE_REGION_SLUG` adalah ID kota di database. Tentukan sekali dan **jangan
  diubah** setelah ada data, karena kota dengan slug baru akan dibuat terpisah.
- Variabel `VITE_*` di atas bukan rahasia; nilainya ikut terbundel ke aplikasi.
  Jangan pernah memberi awalan `VITE_` pada `SUPABASE_SERVICE_ROLE_KEY`.
- Jika dibiarkan kosong, nilai bawaan (instance Sumbawa Besar) yang dipakai.
  Pastikan semuanya terisi untuk daerahmu.

## 4. Siapkan database

```bash
npm install
npx prisma migrate deploy
```

Perintah ini membuat seluruh tabel, kategori default (Kesehatan, Darurat,
Kuliner, dan lainnya), bucket Storage untuk foto, serta kebijakan keamanannya.
Kota wilayah dibuat otomatis saat API pertama kali diakses, jadi tidak perlu
seed untuk produksi.

Data contoh untuk pengembangan lokal (opsional, jangan dipakai di produksi):

```bash
cd server && npm install && set -a && . ../.env && set +a && npm run db:seed
```

## 5. Ganti aset visual

Ganti file berikut di `client/public/` dengan milik daerahmu (nama file sama):

| File | Dipakai untuk |
| --- | --- |
| `brand-logo.png` | Logo di aplikasi dan layar pemuatan |
| `favicon.png`, `apple-touch-icon.png`, `apple-touch-icon-v2.png` | Ikon browser & iOS |
| `pwa-192-v2.png`, `pwa-512-v2.png`, `pwa-192.png`, `pwa-512.png` | Ikon aplikasi terpasang (PWA) |
| `og-thumb.jpg` | Gambar kecil saat link dibagikan (192×192) |
| `hero-sumbawa-v2.webp`, `hero-sumbawa-v2.jpg` | Foto latar beranda (atau arahkan `VITE_HERO_IMAGE` ke file lain) |

Konten contoh yang sebaiknya disesuaikan atau dihapus:

- `client/src/features/storefront/storefrontData.ts` dan `modularCatalogDemo.ts`
  — contoh katalog bisnis di `/catalog` dan `/katalog`, beserta fotonya di
  `client/public/storefront/`.
- `FALLBACK_STOREFRONT` di `client/netlify/edge-functions/detail-preview.ts`
  — preview link untuk contoh katalog di atas.
- Banner promo beranda: ubah lewat **Admin → Hero Promotions** setelah login
  sebagai admin. Gunakan `{city}`, `{brand}`, dan (di tautan) `{whatsapp}`
  agar teks otomatis mengikuti konfigurasi wilayah.

## 6. Deploy

Ikuti [netlify-deployment.md](./netlify-deployment.md). Tambahkan semua
variabel `VITE_APP_*`, `VITE_REGION_*`, `VITE_THEME_COLOR`, dan
`VITE_ADMIN_WHATSAPP` dengan scope **Builds** dan **Functions**: client
membacanya saat build, server membacanya saat berjalan. Build produksi
menjalankan `prisma migrate deploy` otomatis.

Docker juga bisa dipakai (`docker compose up --build`); kedua container
membaca `.env` yang sama.

## 7. Jadikan akun pertama sebagai admin

Daftar lewat aplikasi, lalu jalankan di Supabase SQL Editor:

```sql
UPDATE "profiles" SET "role" = 'ADMIN' WHERE "email" = 'emailmu@contoh.com';
```

## Memindahkan database lama yang berisi banyak kota

Instance lama yang dulu melayani beberapa kota bisa disatukan dengan
[`prisma/queries/merge_into_single_region.sql`](../prisma/queries/merge_into_single_region.sql):
lihat jumlah kontak per kota terlebih dahulu, hapus yang bukan milik
wilayahmu, lalu pindahkan sisanya ke kota wilayah.

## Mengambil pembaruan dari repository utama

Simpan perubahan khusus daerah (aset, konten contoh) dalam commit terpisah,
lalu tarik pembaruan secara berkala:

```bash
git remote add upstream https://github.com/zikrulihsan/bukutelepon.git
git fetch upstream
git merge upstream/main
```

Migration baru dari upstream akan dijalankan otomatis saat deploy berikutnya.
