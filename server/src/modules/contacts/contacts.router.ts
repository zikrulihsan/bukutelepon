import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { z } from "zod";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { requireContribution } from "../../middleware/requireContribution";
import { checkAccess, AccessRequest } from "../../middleware/checkAccess";
import { submitLimiter, apiLimiter } from "../../middleware/rateLimiter";
import { sanitize } from "../../middleware/sanitize";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const GUEST_VIEW_THRESHOLD = parseInt(process.env.GUEST_VIEW_THRESHOLD || "3", 10);

const createContactSchema = z.object({
  name: z.string().min(2).max(200),
  phone: z.string().min(5).max(30),
  address: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  cityId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

// GET /api/contacts — public with gated access
router.get("/", apiLimiter, checkAccess, async (req: AccessRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const citySlug = req.query.city as string | undefined;
    const categorySlug = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const where: Record<string, unknown> = { status: "APPROVED" };

    if (citySlug) where.city = { slug: citySlug };
    if (categorySlug) where.category = { slug: categorySlug };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: { city: true, category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ]);

    // Guests see limited results
    if (!req.isAuthenticated) {
      const limited = contacts.slice(0, GUEST_VIEW_THRESHOLD);
      res.json({
        success: true,
        data: limited,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          guestLimited: true,
          guestThreshold: GUEST_VIEW_THRESHOLD,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        guestLimited: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get("/:id", apiLimiter, checkAccess, async (req: AccessRequest, res, next) => {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: req.params.id as string },
      include: {
        city: true,
        category: true,
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!contact || contact.status !== "APPROVED") {
      throw new AppError(404, "Contact not found");
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts — authenticated users submit contacts
router.post(
  "/",
  authenticate,
  submitLimiter,
  sanitize,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = createContactSchema.parse(req.body);

      const contact = await prisma.contact.create({
        data: {
          ...data,
          submittedById: req.userId!,
          status: "PENDING",
        },
      });

      // Mark user as contributor
      await prisma.profile.update({
        where: { id: req.userId },
        data: { hasContributed: true },
      });

      res.status(201).json({ success: true, data: contact });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/contacts/bulk — authenticated users bulk submit (PENDING)
const bulkSubmitSchema = z.object({
  contacts: z.array(
    z.object({
      name: z.string().min(1).max(200),
      phone: z.string().min(3).max(30),
      address: z.string().max(500).optional(),
    })
  ).min(1).max(50),
  cityId: z.string().uuid(),
  categoryId: z.string().uuid(),
});

router.post(
  "/bulk",
  authenticate,
  submitLimiter,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { contacts, cityId, categoryId } = bulkSubmitSchema.parse(req.body);

      const created = await prisma.contact.createMany({
        data: contacts.map((c) => ({
          name: c.name,
          phone: c.phone,
          address: c.address || null,
          cityId,
          categoryId,
          submittedById: req.userId!,
          status: "PENDING" as const,
        })),
        skipDuplicates: true,
      });

      // Mark user as contributor
      if (created.count > 0) {
        await prisma.profile.update({
          where: { id: req.userId },
          data: { hasContributed: true },
        });
      }

      res.status(201).json({ success: true, data: { count: created.count } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
