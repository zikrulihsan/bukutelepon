import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { requirePro } from "../../middleware/requirePro";
import { AppError } from "../../middleware/errorHandler";
import { prisma } from "../../utils/prisma";
import { deleteCatalogImage } from "../../utils/storage";
import { toSlug } from "../../utils/slug";

const router = Router();

router.use(authenticate);
router.use(requirePro);

const optionalUrl = z.string().url().max(1000).optional().nullable().or(z.literal(""));
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();

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
  status: z.enum(["DRAFT", "ACTIVE", "HIDDEN"]).default("DRAFT"),
});

const itemSchema = z.object({
  type: z.enum(["PRODUCT", "SERVICE", "PACKAGE", "PROMO"]).default("PRODUCT"),
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().min(2).max(80).optional(),
  shortDescription: z.string().trim().min(3).max(240),
  description: z.string().trim().min(3).max(2000),
  category: z.string().trim().min(2).max(80),
  price: z.coerce.number().int().min(0).max(2_000_000_000).default(0),
  priceType: z.enum(["FIXED", "STARTING_FROM", "CONTACT", "FREE"]).default("CONTACT"),
  unit: optionalText(60),
  imageUrl: optionalUrl,
  badge: optionalText(40),
  status: z.enum(["ACTIVE", "HIDDEN", "SOLD_OUT"]).default("ACTIVE"),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
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

// GET /api/pro/business
router.get("/business", async (req: AuthenticatedRequest, res, next) => {
  try {
    const business = await prisma.business.findUnique({
      where: { ownerId: req.userId! },
      include: { items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] } },
    });
    res.json({ success: true, data: business });
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
      status: input.status,
    };

    const business = await prisma.business.upsert({
      where: { ownerId: req.userId! },
      create: { ...data, ownerId: req.userId! },
      update: data,
      include: { items: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] } },
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
