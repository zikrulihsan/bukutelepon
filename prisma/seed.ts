/**
 * Development sample data for the configured region.
 *
 * Categories and the region city come from migrations and the API itself, so
 * production never needs this script. It only adds two placeholder profiles
 * and a handful of clearly marked example contacts for local development.
 * The region is read from the same VITE_REGION_* variables the app uses.
 */
import { PrismaClient, ContactStatus, ReviewStatus, Role, TrustLevel } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const USER_ID = "00000000-0000-0000-0000-000000000002";

const region = {
  name: process.env.VITE_REGION_NAME?.trim() || "Sumbawa Besar",
  slug: process.env.VITE_REGION_SLUG?.trim() || "sumbawa-besar",
  province: process.env.VITE_REGION_PROVINCE?.trim() || "Nusa Tenggara Barat",
};

async function main() {
  // ── Profiles ────────────────────────────────────────────────────────────────
  await prisma.profile.upsert({
    where: { id: ADMIN_ID },
    update: {},
    create: {
      id: ADMIN_ID,
      email: "admin@example.com",
      name: "Admin Contoh",
      role: Role.ADMIN,
      trustLevel: TrustLevel.ID_VERIFIED,
      hasContributed: true,
      contributedAt: new Date("2025-01-01"),
    },
  });

  await prisma.profile.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      email: "user@example.com",
      name: "Warga Contoh",
      role: Role.USER,
      trustLevel: TrustLevel.EMAIL_VERIFIED,
      hasContributed: true,
      contributedAt: new Date("2025-02-01"),
    },
  });

  console.log("✓ Profiles seeded");

  // ── Region city ──────────────────────────────────────────────────────────────
  const city = await prisma.city.upsert({
    where: { slug: region.slug },
    update: { name: region.name, province: region.province },
    create: region,
  });

  console.log(`✓ City seeded: ${city.name}`);

  // ── Contacts ─────────────────────────────────────────────────────────────────
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryId = (slug: string) => {
    const category = categories.find((c) => c.slug === slug);
    if (!category) throw new Error(`Category "${slug}" not found — run "npx prisma migrate deploy" first.`);
    return category.id;
  };

  // Placeholder numbers only: never ship these as real contacts.
  const contactData = [
    { name: `RSUD ${region.name} (Contoh)`, phone: "0800-0000-0001", catSlug: "kesehatan", description: "Data contoh untuk pengembangan." },
    { name: `Puskesmas ${region.name} (Contoh)`, phone: "0800-0000-0002", catSlug: "kesehatan", description: "Data contoh untuk pengembangan." },
    { name: `Pemadam Kebakaran ${region.name} (Contoh)`, phone: "0800-0000-0003", catSlug: "darurat", description: "Data contoh untuk pengembangan." },
    { name: `Kantor Bupati/Wali Kota ${region.name} (Contoh)`, phone: "0800-0000-0004", catSlug: "pemerintah", description: "Data contoh untuk pengembangan." },
    { name: `Warung Makan ${region.name} (Contoh)`, phone: "0800-0000-0005", catSlug: "kuliner", description: "Data contoh untuk pengembangan." },
    { name: `Bengkel ${region.name} (Contoh)`, phone: "0800-0000-0006", catSlug: "jasa", description: "Data contoh untuk pengembangan." },
  ];

  const contactIds: string[] = [];
  for (const [index, c] of contactData.entries()) {
    const existing = await prisma.contact.findFirst({ where: { phone: c.phone, cityId: city.id } });
    const contact = existing ?? await prisma.contact.create({
      data: {
        name: c.name,
        phone: c.phone,
        address: region.name,
        description: c.description,
        status: ContactStatus.APPROVED,
        cityId: city.id,
        categoryId: categoryId(c.catSlug),
        submittedById: index % 2 === 0 ? ADMIN_ID : USER_ID,
      },
    });
    contactIds.push(contact.id);
  }

  console.log(`✓ ${contactIds.length} Contacts seeded`);

  // ── Reviews ──────────────────────────────────────────────────────────────────
  await prisma.review.upsert({
    where: { contactId_authorId: { contactId: contactIds[4], authorId: USER_ID } },
    update: {},
    create: {
      rating: 5,
      comment: "Ulasan contoh untuk pengembangan.",
      status: ReviewStatus.APPROVED,
      contactId: contactIds[4],
      authorId: USER_ID,
    },
  });
  await prisma.contact.update({ where: { id: contactIds[4] }, data: { avgRating: 5, reviewCount: 1 } });

  console.log("✓ Reviews seeded");
  console.log("\n✅ Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
