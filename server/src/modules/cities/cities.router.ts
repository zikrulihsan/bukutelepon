import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";
import { getRegionCityId, region } from "../../utils/region";

const router = Router();

const cityInclude = {
  _count: {
    select: {
      contacts: { where: { status: "APPROVED" as const } },
    },
  },
};

// GET /api/cities — this deployment serves exactly one city.
router.get("/", apiLimiter, async (_req, res, next) => {
  try {
    const id = await getRegionCityId();
    const city = await prisma.city.findUnique({ where: { id }, include: cityInclude });

    res.json({ success: true, data: city ? [city] : [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/cities/:slug
router.get("/:slug", apiLimiter, async (req, res, next) => {
  try {
    if (req.params.slug !== region.slug) {
      res.status(404).json({ success: false, message: "City not found" });
      return;
    }

    const id = await getRegionCityId();
    const city = await prisma.city.findUnique({ where: { id }, include: cityInclude });

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
