/**
 * Seed kecamatans from wilayah.id API.
 *
 * Run after prisma db push / migrate and after seed.ts has populated cities:
 *   npx tsx prisma/seed-kecamatans.ts
 *
 * wilayah.id district endpoint:
 *   GET https://wilayah.id/api/districts/{regencyCode}.json
 *   Returns: [{ code: "31.74.01", name: "PASAR MINGGU" }, ...]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function fetchDistricts(regencyCode: string): Promise<{ code: string; name: string }[]> {
  const url = `https://wilayah.id/api/districts/${regencyCode}.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch districts for ${regencyCode}: ${res.status}`);
  }
  return res.json() as Promise<{ code: string; name: string }[]>;
}

async function main() {
  const cities = await prisma.city.findMany({ where: { code: { not: null } } });

  if (cities.length === 0) {
    console.error("No cities with wilayah.id codes found. Run seed.ts first.");
    process.exit(1);
  }

  let total = 0;

  for (const city of cities) {
    const code = city.code!;
    console.log(`Fetching kecamatans for ${city.name} (${code})...`);

    let districts: { code: string; name: string }[];
    try {
      districts = await fetchDistricts(code);
    } catch (err) {
      console.error(`  Skipping ${city.name}: ${(err as Error).message}`);
      continue;
    }

    for (const d of districts) {
      const slug = `${city.slug}-${toSlug(d.name)}`;
      await prisma.kecamatan.upsert({
        where: { code: d.code },
        update: { name: d.name, slug, cityId: city.id },
        create: { code: d.code, name: d.name, slug, cityId: city.id },
      });
    }

    total += districts.length;
    console.log(`  ✓ ${districts.length} kecamatans seeded for ${city.name}`);
  }

  console.log(`\n✅ Done. Total kecamatans seeded: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
