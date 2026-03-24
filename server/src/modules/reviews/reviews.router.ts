import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { z } from "zod";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { requireContribution } from "../../middleware/requireContribution";
import { submitLimiter, apiLimiter } from "../../middleware/rateLimiter";
import { sanitize } from "../../middleware/sanitize";
import { AppError } from "../../middleware/errorHandler";

const router = Router();

const createReviewSchema = z.object({
  contactId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// GET /api/reviews?contactId=xxx
router.get("/", apiLimiter, async (req, res, next) => {
  try {
    const contactId = req.query.contactId as string;

    if (!contactId) {
      throw new AppError(400, "contactId query parameter is required");
    }

    const reviews = await prisma.review.findMany({
      where: { contactId, status: "APPROVED" },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews
router.post(
  "/",
  authenticate,
  requireContribution,
  submitLimiter,
  sanitize,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const data = createReviewSchema.parse(req.body);

      const existingReview = await prisma.review.findFirst({
        where: { contactId: data.contactId, authorId: req.userId },
      });

      if (existingReview) {
        throw new AppError(409, "You have already reviewed this contact");
      }

      const review = await prisma.review.create({
        data: {
          ...data,
          authorId: req.userId!,
          status: "PENDING",
        },
      });

      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
