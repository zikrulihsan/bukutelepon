import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../utils/prisma";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { requireRole } from "../../middleware/requireRole";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(requireRole("ADMIN"));

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
  description: z.string().max(500).optional(),
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

// GET /api/admin/contacts?status=PENDING
router.get("/contacts", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

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
  description: z.string().max(500).optional().nullable(),
  cityId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

router.put("/contacts/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = adminEditContactSchema.parse(req.body);

    const contact = await prisma.contact.update({
      where: { id: req.params.id as string },
      data,
      include: { city: true, category: true },
    });

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
    });

    res.json({ success: true, data: contact });
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

export default router;
