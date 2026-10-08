import { prisma } from "./prisma";

/**
 * The single city this deployment serves. Each region runs its own database,
 * and these values match the client's VITE_REGION_* settings so one .env
 * configures both sides. Fallbacks are the original Sumbawa Besar instance.
 */
export const region = {
  name: process.env.VITE_REGION_NAME?.trim() || "Sumbawa Besar",
  slug: process.env.VITE_REGION_SLUG?.trim() || "sumbawa-besar",
  province: process.env.VITE_REGION_PROVINCE?.trim() || "Nusa Tenggara Barat",
};

let regionCityId: Promise<string> | null = null;

/**
 * Returns the region city's id, creating the row on first use so a fresh
 * database needs no manual seeding. Name and province follow the env.
 */
export function getRegionCityId(): Promise<string> {
  if (!regionCityId) {
    regionCityId = prisma.city
      .upsert({
        where: { slug: region.slug },
        update: { name: region.name, province: region.province },
        create: { name: region.name, province: region.province, slug: region.slug },
        select: { id: true },
      })
      .then((city) => city.id)
      .catch((err) => {
        regionCityId = null;
        throw err;
      });
  }
  return regionCityId;
}
