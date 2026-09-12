import { Router } from "express";
import { Prisma, ContactStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";
import { AppError } from "../../middleware/errorHandler";
import { deleteContactImage, deleteHeroImage } from "../../utils/storage";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole("ADMIN"));

function isInternalPath(value: string): boolean {
  return /^\/(?!\/)/.test(value);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const optionalPromoText = (max: number) => z.preprocess(
  (value) => typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().max(max).nullable().optional()
);

const heroPromotionSchema = z.object({
  title: z.string().trim().min(2).max(160),
  titleEn: optionalPromoText(160),
  highlight: optionalPromoText(160),
  highlightEn: optionalPromoText(160),
  description: z.string().trim().min(2).max(500),
  descriptionEn: optionalPromoText(500),
  imageUrl: z.string().trim().min(1).max(2048).refine(
    (value) => isInternalPath(value) || isHttpsUrl(value),
    "Gambar harus berupa path internal atau URL HTTPS"
  ),
  href: z.string().trim().min(1).max(2048).refine(
    (value) => isInternalPath(value) || isHttpsUrl(value),
    "Tujuan harus berupa path internal atau URL HTTPS"
  ),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// GET /api/admin/hero-promotions
router.get("/hero-promotions", async (_req, res, next) => {
  try {
    const promotions = await prisma.heroPromotion.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/hero-promotions
router.post("/hero-promotions", async (req, res, next) => {
  try {
    const data = heroPromotionSchema.parse(req.body);
    const last = await prisma.heroPromotion.aggregate({ _max: { sortOrder: true } });
    const promotion = await prisma.heroPromotion.create({
      data: {
        ...data,
        sortOrder: data.sortOrder ?? (last._max.sortOrder ?? -1) + 1,
      },
    });
    res.status(201).json({ success: true, data: promotion });
  } catch (err) {
    next(err);
  }
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).refine(
    (ids) => new Set(ids).size === ids.length,
    "Urutan promo berisi ID duplikat"
  ),
});

// PUT /api/admin/hero-promotions/reorder
router.put("/hero-promotions/reorder", async (req, res, next) => {
  try {
    const { orderedIds } = reorderSchema.parse(req.body);
    const existing = await prisma.heroPromotion.count({ where: { id: { in: orderedIds } } });
    if (existing !== orderedIds.length) throw new AppError(404, "Satu atau beberapa promo tidak ditemukan");

    await prisma.$transaction(
      orderedIds.map((id, sortOrder) => prisma.heroPromotion.update({
        where: { id },
        data: { sortOrder },
      }))
    );
    const promotions = await prisma.heroPromotion.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

const toggleHeroPromotionSchema = z.object({ isActive: z.boolean() });

// PATCH /api/admin/hero-promotions/:id/toggle
router.patch("/hero-promotions/:id/toggle", async (req, res, next) => {
  try {
    const { isActive } = toggleHeroPromotionSchema.parse(req.body);
    const promotion = await prisma.heroPromotion.update({
      where: { id: req.params.id as string },
      data: { isActive },
    });
    res.json({ success: true, data: promotion });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/hero-promotions/:id
router.put("/hero-promotions/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = heroPromotionSchema.parse(req.body);
    const id = req.params.id as string;
    const previous = await prisma.heroPromotion.findUnique({ where: { id } });
    if (!previous) throw new AppError(404, "Promo hero tidak ditemukan");

    const promotion = await prisma.heroPromotion.update({ where: { id }, data });
    if (previous.imageUrl !== promotion.imageUrl) {
      await deleteHeroImage(previous.imageUrl);
    }
    res.json({ success: true, data: promotion });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/hero-promotions/:id
router.delete("/hero-promotions/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const previous = await prisma.heroPromotion.findUnique({ where: { id } });
    if (!previous) throw new AppError(404, "Promo hero tidak ditemukan");

    await prisma.heroPromotion.delete({ where: { id } });
    await deleteHeroImage(previous.imageUrl);
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/stats
router.get("/stats", async (_req, res, next) => {
  try {
    const [totalContacts, pendingContacts, totalUsers, totalReviews] = await Promise.all([
      prisma.contact.count(),
      prisma.contact.count({ where: { status: "PENDING" } }),
      prisma.profile.count(),
      prisma.review.count(),
    ]);

    res.json({
      success: true,
      data: { totalContacts, pendingContacts, totalUsers, totalReviews },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/contacts — admin direct create (auto-approved)
const adminCreateContactSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(1).max(30),
  address: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  mapsUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  descriptionEn: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  cityId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

router.post("/contacts", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = adminCreateContactSchema.parse(req.body);

    const contact = await prisma.contact.create({
      data: {
        ...data,
        submittedById: req.userId!,
        status: "APPROVED",
      },
      include: { city: true, category: true },
    });

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/contacts/bulk — bulk import contacts (auto-approved)
const bulkContactSchema = z.object({
  contacts: z.array(
    z.object({
      name: z.string().min(1).max(200),
      phone: z.string().min(3).max(30),
      address: z.string().max(500).optional(),
    })
  ).min(1).max(100),
  cityId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

router.post("/contacts/bulk", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { contacts, cityId, categoryId } = bulkContactSchema.parse(req.body);

    const created = await prisma.contact.createMany({
      data: contacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        address: c.address || null,
        cityId,
        categoryId,
        submittedById: req.userId!,
        status: "APPROVED" as const,
      })),
      skipDuplicates: true,
    });

    res.status(201).json({ success: true, data: { count: created.count } });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/contacts?status=PENDING&search=nama
router.get("/contacts", async (req, res, next) => {
  try {
    const status = req.query.status as ContactStatus | undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const where: Prisma.ContactWhereInput = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
        { city: { name: { contains: search, mode: "insensitive" } } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { city: true, category: true, submittedBy: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: contacts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/contacts/:id — edit contact
const adminEditContactSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(30).optional(),
  address: z.string().max(500).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  mapsUrl: z.string().url().optional().nullable().or(z.literal("")),
  description: z.string().max(500).optional().nullable(),
  descriptionEn: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  cityId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

router.put("/contacts/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = adminEditContactSchema.parse(req.body);
    const id = req.params.id as string;

    const previous = await prisma.contact.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    const contact = await prisma.contact.update({
      where: { id },
      data,
      include: { city: true, category: true },
    });

    // The photo was replaced or cleared — drop the old object so the bucket
    // doesn't accumulate files nothing references.
    if (previous?.imageUrl && previous.imageUrl !== contact.imageUrl) {
      await deleteContactImage(previous.imageUrl);
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/contacts/:id/approve
router.patch("/contacts/:id/approve", async (req: AuthenticatedRequest, res, next) => {
  try {
    const contact = await prisma.contact.update({
      where: { id: req.params.id as string },
      data: { status: "APPROVED" },
      include: { city: true, category: true, submittedBy: true },
    });

    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/contacts/:id/reject
router.patch("/contacts/:id/reject", async (req: AuthenticatedRequest, res, next) => {
  try {
    const contact = await prisma.contact.update({
      where: { id: req.params.id as string },
      data: { status: "REJECTED" },
      include: { city: true, category: true, submittedBy: true },
    });

    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

const catalogLinkStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

// GET /api/admin/catalog-link-requests?status=PENDING
router.get("/catalog-link-requests", async (req, res, next) => {
  try {
    const parsed = catalogLinkStatusSchema.safeParse(req.query.status ?? "PENDING");
    if (!parsed.success) throw new AppError(400, "Status pengajuan tidak valid");

    const requests = await prisma.catalogLinkRequest.findMany({
      where: { status: parsed.data },
      include: {
        business: { include: { owner: { select: { id: true, name: true, email: true, phone: true } } } },
        contact: { include: { city: true, category: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/catalog-link-requests/:id/approve
router.patch("/catalog-link-requests/:id/approve", async (req, res, next) => {
  try {
    const request = await prisma.catalogLinkRequest.findUnique({
      where: { id: req.params.id as string },
      include: { contact: true },
    });
    if (!request) throw new AppError(404, "Pengajuan katalog tidak ditemukan");
    if (request.contact.status !== "APPROVED") throw new AppError(409, "Profil kontak belum disetujui");
    if (request.contact.businessId && request.contact.businessId !== request.businessId) {
      throw new AppError(409, "Profil kontak sudah terhubung ke etalase lain");
    }

    const approved = await prisma.$transaction(async (tx) => {
      // A business can have exactly one public directory profile. Re-linking it
      // intentionally removes the old association before attaching the new one.
      await tx.contact.updateMany({
        where: { businessId: request.businessId },
        data: { businessId: null },
      });
      await tx.contact.update({
        where: { id: request.contactId },
        data: { businessId: request.businessId },
      });
      return tx.catalogLinkRequest.update({
        where: { id: request.id },
        data: { status: "APPROVED" },
        include: {
          business: { include: { owner: { select: { id: true, name: true, email: true, phone: true } } } },
          contact: { include: { city: true, category: true } },
        },
      });
    });

    res.json({ success: true, data: approved });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/catalog-link-requests/:id/reject
router.patch("/catalog-link-requests/:id/reject", async (req, res, next) => {
  try {
    const rejected = await prisma.catalogLinkRequest.update({
      where: { id: req.params.id as string },
      data: { status: "REJECTED" },
      include: {
        business: { include: { owner: { select: { id: true, name: true, email: true, phone: true } } } },
        contact: { include: { city: true, category: true } },
      },
    });
    res.json({ success: true, data: rejected });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reviews?status=PENDING
router.get("/reviews", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { contact: true, author: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reviews/:id/approve
router.patch("/reviews/:id/approve", async (_req, res, next) => {
  try {
    const review = await prisma.review.update({
      where: { id: _req.params.id as string },
      data: { status: "APPROVED" },
    });

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reviews/:id/reject
router.patch("/reviews/:id/reject", async (_req, res, next) => {
  try {
    const review = await prisma.review.update({
      where: { id: _req.params.id as string },
      data: { status: "REJECTED" },
    });

    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users
router.get("/users", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.profile.count(),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

const planSchema = z.object({ plan: z.enum(["FREE", "PRO"]) });

// PATCH /api/admin/users/:id/plan — grants or revokes Pro access.
router.patch("/users/:id/plan", async (req, res, next) => {
  try {
    const { plan } = planSchema.parse(req.body);
    const id = req.params.id as string;

    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.profile.update({ where: { id }, data: { plan } });
      if (plan === "FREE") {
        await tx.business.updateMany({ where: { ownerId: id }, data: { status: "HIDDEN" } });
      }
      return updated;
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
