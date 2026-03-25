import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";

const router = Router();

// GET /api/cities
router.get("/", apiLimiter, async (_req, res, next) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            contacts: { where: { status: "APPROVED" } },
          },
        },
      },
    });

    res.json({ success: true, data: cities });
  } catch (err) {
    next(err);
  }
});

// GET /api/cities/:slug
router.get("/:slug", apiLimiter, async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { slug: req.params.slug as string },
      include: {
        _count: {
          select: {
            contacts: { where: { status: "APPROVED" } },
          },
        },
      },
    });

    if (!city) {
      res.status(404).json({ success: false, message: "City not found" });
      return;
    }

    res.json({ success: true, data: city });
  } catch (err) {
    next(err);
  }
});

export default router;
