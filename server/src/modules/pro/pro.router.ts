import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { requirePro } from "../../middleware/requirePro";
import { AppError } from "../../middleware/errorHandler";
import { prisma } from "../../utils/prisma";
import { deleteCatalogImage, isOwnedCatalogImage } from "../../utils/storage";
import { toSlug } from "../../utils/slug";

const router = Router();

router.use(authenticate);
router.use(requirePro);

const optionalUrl = z.string().url().max(1000).optional().nullable().or(z.literal(""));
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
const catalogAccent = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Warna aksen harus memakai format hex, misalnya #0F766E");

const businessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().min(10).max(1000),
  whatsapp: z.string().trim().min(8).max(20),
  alternateWhatsapp: optionalText(20),
  instagram: optionalText(100),
  address: optionalText(500),
  mapsUrl: optionalUrl,
  openingHours: optionalText(160),
  logoUrl: optionalUrl,
  coverUrl: optionalUrl,
  catalogPreset: z.enum(["RESTAURANT", "SERVICE", "RETAIL", "ACTIVITY"]).default("RETAIL"),
  defaultItemLayout: z.enum(["ROW", "CARD"]).default("CARD"),
  catalogTheme: z.enum(["MODERN", "WARM", "MINIMAL", "BOLD"]).default("MODERN"),
  catalogAccent: catalogAccent.default("#0F766E"),
  catalogNavigationStyle: z.enum(["COMPACT_SLIDER", "POSTER_SLIDER", "GRID"]).default("COMPACT_SLIDER"),
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN"]).default("DRAFT"),
});

const presentationSchema = z.object({
  catalogPreset: z.enum(["RESTAURANT", "SERVICE", "RETAIL", "ACTIVITY"]),
  defaultItemLayout: z.enum(["ROW", "CARD"]),
  catalogTheme: z.enum(["MODERN", "WARM", "MINIMAL", "BOLD"]),
  catalogAccent,
  catalogNavigationStyle: z.enum(["COMPACT_SLIDER", "POSTER_SLIDER", "GRID"]),
});

const optionalDate = z.string().datetime().optional().nullable().or(z.literal(""));

const sectionSchema = z.object({
  type: z.enum(["ITEM_GROUP", "PROMOTION", "ACTIVITY", "INFORMATION", "BANNER"]),
  title: z.string().trim().min(2).max(160),
  subtitle: optionalText(500),
  category: optionalText(80),
  layout: z.enum(["ROW", "CARD"]).default("CARD"),
  imageUrl: optionalUrl,
  badge: optionalText(40),
  ctaLabel: optionalText(80),
  ctaUrl: optionalUrl,
  scheduleLabel: optionalText(120),
  startsAt: optionalDate,
  endsAt: optionalDate,
  status: z.enum(["ACTIVE", "HIDDEN"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
}).superRefine((value, context) => {
  if (value.type === "ITEM_GROUP" && !value.category?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["category"], message: "Kategori wajib dipilih untuk section grup" });
  }
  if (value.startsAt && value.endsAt && new Date(value.startsAt) > new Date(value.endsAt)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "Tanggal selesai harus setelah tanggal mulai" });
  }
});

const sectionReorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).max(100),
});

const itemSchema = z.object({
  type: z.enum(["PRODUCT", "SERVICE", "PACKAGE", "PROMO"]).default("PRODUCT"),
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(80).optional(),
  shortDescription: z.string().trim().max(240).default(""),
  description: z.string().trim().max(2000).default(""),
  category: z.string().trim().min(2).max(80),
  price: z.coerce.number().int().min(0).max(2_000_000_000).default(0),
  priceType: z.enum(["FIXED", "STARTING_FROM", "CONTACT", "FREE"]).default("CONTACT"),
  unit: optionalText(60),
  imageUrl: optionalUrl,
  badge: optionalText(40),
  status: z.enum(["ACTIVE", "HIDDEN", "SOLD_OUT"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

const bulkEnvelopeSchema = z.object({
  items: z.array(z.unknown()).min(1).max(20),
});

const bulkItemSchema = itemSchema
  .omit({ slug: true })
  .extend({
    clientId: z.string().trim().min(1).max(100),
    imageUrl: z.string().url().max(1000),
    priceType: z.enum(["CONTACT", "FIXED"]),
  })
  .superRefine((value, context) => {
    if (value.priceType === "FIXED" && value.price <= 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Harga harus lebih dari 0",
      });
    }
  });

const cleanupImageSchema = z.object({
  imageUrl: z.string().url().max(1000),
});

const catalogLinkSchema = z.object({
  contactId: z.string().uuid(),
});

function nullable(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanPhone(value: string | null | undefined): string | null {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (!digits) return null;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

async function ownedBusiness(userId: string) {
  const business = await prisma.business.findUnique({ where: { ownerId: userId } });
  if (!business) throw new AppError(404, "Etalase belum dibuat");
  return business;
}

function handleUniqueError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    throw new AppError(409, "Slug sudah digunakan. Silakan pilih alamat etalase lain.");
  }
  throw err;
}

function validationMessage(error: z.ZodError): string {
  return error.errors[0]?.message || "Data produk tidak valid";
}

function databaseMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Nama produk menghasilkan alamat yang sudah digunakan";
  }
  return "Produk gagal disimpan. Silakan coba lagi.";
}

function nextAvailableSlug(name: string, usedSlugs: Set<string>): string {
  const base = toSlug(name);
  if (base.length < 2) throw new AppError(400, "Nama produk tidak dapat dijadikan slug");
  if (!usedSlugs.has(base)) {
    usedSlugs.add(base);
    return base;
  }

  let suffix = 2;
  while (suffix < 10_000) {
    const suffixText = `-${suffix}`;
    const candidate = `${base.slice(0, 80 - suffixText.length).replace(/-+$/, "")}${suffixText}`;
    if (!usedSlugs.has(candidate)) {
      usedSlugs.add(candidate);
      return candidate;
    }
    suffix += 1;
  }

  throw new AppError(409, "Tidak dapat membuat slug produk yang unik");
}

// GET /api/pro/business
router.get("/business", async (req: AuthenticatedRequest, res, next) => {
  try {
    const business = await prisma.business.findUnique({
      where: { ownerId: req.userId! },
      include: {
        items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
        sections: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        contact: { include: { city: true, category: true } },
        catalogLinkRequest: { include: { contact: { include: { city: true, category: true } } } },
      },
    });
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pro/business/presentation — updates catalog defaults without resubmitting the full profile form.
router.put("/business/presentation", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = presentationSchema.parse(req.body);
    const owned = await ownedBusiness(req.userId!);
    const business = await prisma.business.update({
      where: { id: owned.id },
      data: { ...input, catalogAccent: input.catalogAccent.toUpperCase() },
      include: {
        items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
        sections: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        contact: { include: { city: true, category: true } },
        catalogLinkRequest: { include: { contact: { include: { city: true, category: true } } } },
      },
    });
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
});

// GET /api/pro/contact-candidates — approved directory profiles that may be claimed.
router.get("/contact-candidates", async (req: AuthenticatedRequest, res, next) => {
  try {
    const business = await ownedBusiness(req.userId!);
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
    const contacts = await prisma.contact.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { businessId: null },
          { businessId: business.id },
        ],
        ...(search ? {
          AND: [{
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
            ],
          }],
        } : {}),
      },
      include: { city: true, category: true },
      take: 20,
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pro/catalog-link-request — requests an admin review before a catalog is shown on a contact profile.
router.put("/catalog-link-request", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { contactId } = catalogLinkSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });

    if (!contact || contact.status !== "APPROVED") {
      throw new AppError(404, "Profil kontak tidak ditemukan atau belum disetujui");
    }
    if (contact.businessId && contact.businessId !== business.id) {
      throw new AppError(409, "Profil kontak tersebut sudah terhubung ke etalase lain");
    }

    const request = await prisma.catalogLinkRequest.upsert({
      where: { businessId: business.id },
      create: { businessId: business.id, contactId, status: "PENDING" },
      update: { contactId, status: "PENDING" },
      include: { contact: { include: { city: true, category: true } } },
    });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pro/business — creates the merchant's one storefront or updates it.
router.put("/business", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = businessSchema.parse(req.body);
    const existing = await prisma.business.findUnique({ where: { ownerId: req.userId! } });
    const slug = toSlug(input.slug || input.name);
    if (slug.length < 2) throw new AppError(400, "Slug etalase tidak valid");

    const data = {
      name: input.name,
      slug,
      description: input.description,
      whatsapp: cleanPhone(input.whatsapp)!,
      alternateWhatsapp: cleanPhone(input.alternateWhatsapp),
      instagram: nullable(input.instagram)?.replace(/^@/, "") ?? null,
      address: nullable(input.address),
      mapsUrl: nullable(input.mapsUrl),
      openingHours: nullable(input.openingHours),
      logoUrl: nullable(input.logoUrl),
      coverUrl: nullable(input.coverUrl),
      catalogPreset: input.catalogPreset,
      defaultItemLayout: input.defaultItemLayout,
      catalogTheme: input.catalogTheme,
      catalogAccent: input.catalogAccent.toUpperCase(),
      catalogNavigationStyle: input.catalogNavigationStyle,
      status: input.status,
    };

    const business = await prisma.business.upsert({
      where: { ownerId: req.userId! },
      create: { ...data, ownerId: req.userId! },
      update: data,
      include: {
        items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
        sections: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        contact: { include: { city: true, category: true } },
        catalogLinkRequest: { include: { contact: { include: { city: true, category: true } } } },
      },
    });

    if (existing) {
      if (existing.logoUrl && existing.logoUrl !== business.logoUrl) await deleteCatalogImage(existing.logoUrl, req.userId!);
      if (existing.coverUrl && existing.coverUrl !== business.coverUrl) await deleteCatalogImage(existing.coverUrl, req.userId!);
    }

    res.json({ success: true, data: business });
  } catch (err) {
    try { handleUniqueError(err); } catch (handled) { next(handled); }
  }
});

// POST /api/pro/items
router.post("/items", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = itemSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const slug = toSlug(input.slug || input.name);
    if (slug.length < 2) throw new AppError(400, "Slug item tidak valid");

    const item = await prisma.storefrontItem.create({
      data: {
        ...input,
        slug,
        businessId: business.id,
        unit: nullable(input.unit),
        imageUrl: nullable(input.imageUrl),
        badge: nullable(input.badge),
      },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    try { handleUniqueError(err); } catch (handled) { next(handled); }
  }
});

// POST /api/pro/items/bulk — creates up to 20 independently validated catalog items.
router.post("/items/bulk", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { items } = bulkEnvelopeSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const existingItems = await prisma.storefrontItem.findMany({
      where: { businessId: business.id },
      select: { slug: true },
    });
    const usedSlugs = new Set(existingItems.map((item) => item.slug));

    const created: Array<{ clientId: string; item: unknown }> = [];
    const failed: Array<{ clientId: string; message: string }> = [];

    for (let index = 0; index < items.length; index += 1) {
      const raw = items[index];
      const fallbackClientId = typeof raw === "object" && raw !== null && "clientId" in raw
        ? String((raw as { clientId?: unknown }).clientId ?? `item-${index + 1}`)
        : `item-${index + 1}`;
      const parsed = bulkItemSchema.safeParse(raw);
      if (!parsed.success) {
        failed.push({ clientId: fallbackClientId, message: validationMessage(parsed.error) });
        continue;
      }

      const input = parsed.data;
      if (!isOwnedCatalogImage(input.imageUrl, req.userId!)) {
        failed.push({ clientId: input.clientId, message: "Foto bukan milik akun yang sedang login" });
        continue;
      }

      let slug: string;
      try {
        slug = nextAvailableSlug(input.name, usedSlugs);
      } catch (error) {
        failed.push({
          clientId: input.clientId,
          message: error instanceof Error ? error.message : "Slug produk tidak valid",
        });
        continue;
      }

      try {
        const { clientId, ...data } = input;
        const item = await prisma.storefrontItem.create({
          data: {
            ...data,
            slug,
            businessId: business.id,
            unit: nullable(data.unit),
            imageUrl: data.imageUrl,
            badge: nullable(data.badge),
          },
        });
        created.push({ clientId, item });
      } catch (error) {
        usedSlugs.delete(slug);
        failed.push({ clientId: input.clientId, message: databaseMessage(error) });
      }
    }

    res.status(failed.length === 0 ? 201 : 200).json({
      success: failed.length === 0,
      data: { created, failed },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/pro/sections — adds an ordered module to the public catalog.
router.post("/sections", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = sectionSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const section = await prisma.catalogSection.create({
      data: {
        ...input,
        businessId: business.id,
        subtitle: nullable(input.subtitle),
        category: nullable(input.category),
        imageUrl: nullable(input.imageUrl),
        badge: nullable(input.badge),
        ctaLabel: nullable(input.ctaLabel),
        ctaUrl: nullable(input.ctaUrl),
        scheduleLabel: nullable(input.scheduleLabel),
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      },
    });
    res.status(201).json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pro/sections/reorder — persists the dashboard order atomically.
router.put("/sections/reorder", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { orderedIds } = sectionReorderSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const ownedSections = await prisma.catalogSection.findMany({
      where: { businessId: business.id, id: { in: orderedIds } },
      select: { id: true },
    });
    if (ownedSections.length !== orderedIds.length) throw new AppError(403, "Urutan section tidak valid");
    await prisma.$transaction(orderedIds.map((id, index) => prisma.catalogSection.update({ where: { id }, data: { sortOrder: index } })));
    const sections = await prisma.catalogSection.findMany({ where: { businessId: business.id }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    res.json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pro/sections/:id
router.put("/sections/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = sectionSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const id = req.params.id as string;
    const existing = await prisma.catalogSection.findFirst({ where: { id, businessId: business.id } });
    if (!existing) throw new AppError(404, "Section katalog tidak ditemukan");
    const section = await prisma.catalogSection.update({
      where: { id },
      data: {
        ...input,
        subtitle: nullable(input.subtitle),
        category: nullable(input.category),
        imageUrl: nullable(input.imageUrl),
        badge: nullable(input.badge),
        ctaLabel: nullable(input.ctaLabel),
        ctaUrl: nullable(input.ctaUrl),
        scheduleLabel: nullable(input.scheduleLabel),
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      },
    });
    if (existing.imageUrl && existing.imageUrl !== section.imageUrl) await deleteCatalogImage(existing.imageUrl, req.userId!);
    res.json({ success: true, data: section });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pro/sections/:id
router.delete("/sections/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const business = await ownedBusiness(req.userId!);
    const id = req.params.id as string;
    const existing = await prisma.catalogSection.findFirst({ where: { id, businessId: business.id } });
    if (!existing) throw new AppError(404, "Section katalog tidak ditemukan");
    await prisma.catalogSection.delete({ where: { id } });
    await deleteCatalogImage(existing.imageUrl, req.userId!);
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pro/images — removes an owner-scoped upload that was not saved.
router.delete("/images", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { imageUrl } = cleanupImageSchema.parse(req.body);
    if (!isOwnedCatalogImage(imageUrl, req.userId!)) {
      throw new AppError(403, "Foto bukan milik akun yang sedang login");
    }
    const business = await prisma.business.findUnique({
      where: { ownerId: req.userId! },
      select: { id: true, logoUrl: true, coverUrl: true },
    });
    const referencedItem = business
      ? await prisma.storefrontItem.findFirst({
        where: { businessId: business.id, imageUrl },
        select: { id: true },
      })
      : null;
    const referencedSection = business
      ? await prisma.catalogSection.findFirst({
        where: { businessId: business.id, imageUrl },
        select: { id: true },
      })
      : null;
    if (business?.logoUrl === imageUrl || business?.coverUrl === imageUrl || referencedItem || referencedSection) {
      throw new AppError(409, "Foto masih digunakan oleh etalase");
    }
    await deleteCatalogImage(imageUrl, req.userId!);
    res.json({ success: true, data: { imageUrl } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pro/items/:id
router.put("/items/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = itemSchema.parse(req.body);
    const business = await ownedBusiness(req.userId!);
    const id = req.params.id as string;
    const existing = await prisma.storefrontItem.findFirst({ where: { id, businessId: business.id } });
    if (!existing) throw new AppError(404, "Item tidak ditemukan");

    const slug = toSlug(input.slug || input.name);
    const item = await prisma.storefrontItem.update({
      where: { id },
      data: {
        ...input,
        slug,
        unit: nullable(input.unit),
        imageUrl: nullable(input.imageUrl),
        badge: nullable(input.badge),
      },
    });
    if (existing.imageUrl && existing.imageUrl !== item.imageUrl) await deleteCatalogImage(existing.imageUrl, req.userId!);
    res.json({ success: true, data: item });
  } catch (err) {
    try { handleUniqueError(err); } catch (handled) { next(handled); }
  }
});

// DELETE /api/pro/items/:id
router.delete("/items/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const business = await ownedBusiness(req.userId!);
    const id = req.params.id as string;
    const existing = await prisma.storefrontItem.findFirst({ where: { id, businessId: business.id } });
    if (!existing) throw new AppError(404, "Item tidak ditemukan");

    await prisma.storefrontItem.delete({ where: { id } });
    await deleteCatalogImage(existing.imageUrl, req.userId!);
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

export default router;
