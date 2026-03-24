import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";

const router = Router();

// GET /api/categories
router.get("/", apiLimiter, async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { contacts: true } },
      },
    });

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

export default router;
