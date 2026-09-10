# Deploy CariKontak di Netlify

## Yang berjalan di mana

- Netlify: React/Vite, Edge Function preview pencarian, dan Express API sebagai satu Netlify Function.
- Supabase: PostgreSQL, Auth, dan Storage. Jangan pindahkan kredensial atau database ke Netlify.

## Konfigurasi project Netlify

1. Hubungkan repository ini ke satu project Netlify.
2. Set **Base directory** ke kosong (repository root), agar `netlify.toml` di root dipakai.
3. Gunakan branch `main` sebagai production branch.
4. Biarkan build settings mengikuti `netlify.toml`; jangan pakai konfigurasi lama yang berbasis folder `client`.

## Environment variables

Tambahkan di Netlify UI dengan scope **Builds** dan **Functions**:

| Variabel | Nilai |
| --- | --- |
| `DATABASE_URL` | Supabase pooler URL, dengan `pgbouncer=true` |
| `DIRECT_URL` | Supabase direct PostgreSQL URL |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret server-side; jangan pernah diawali `VITE_` |
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Publishable/anon key Supabase |
| `CLIENT_URL` | `https://carikontak.com` |
| `GUEST_VIEW_THRESHOLD` | Misalnya `3` |

`VITE_API_URL` sengaja tidak diisi karena API kini memakai relative path `/api` pada domain yang sama.

## Migration produksi

Deploy production menjalankan `prisma migrate deploy` sebelum bundle baru dipublikasikan. Hanya deploy dari `main` yang melakukan ini; Deploy Preview tidak menyentuh database produksi.

Sebelum push, buat migration baru di lokal dan commit folder `prisma/migrations/`:

```bash
npx prisma migrate dev --name nama_perubahan
git add prisma/migrations prisma/schema.prisma
```

Jangan gunakan `prisma migrate dev` atau `prisma db push` di production.

## Setelah deploy pertama

1. Buka `https://carikontak.com/api/health` dan pastikan responsnya `status: ok`.
2. Buka aplikasi dan login untuk memastikan `/api/auth/me` bekerja.
3. Buka `/catalog`; foto Pro tetap diambil langsung dari Supabase Storage.
