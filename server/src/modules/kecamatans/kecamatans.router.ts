import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";

const router = Router();

// GET /api/kecamatans?city=<city-slug>
router.get("/", apiLimiter, async (req, res, next) => {
  try {
    const citySlug = req.query.city as string | undefined;

    if (!citySlug) {
      res.status(400).json({ success: false, message: "Query param 'city' is required" });
      return;
    }

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      res.status(404).json({ success: false, message: "City not found" });
      return;
    }

    const kecamatans = await prisma.kecamatan.findMany({
      where: { cityId: city.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            contacts: { where: { status: "APPROVED" } },
          },
        },
      },
    });

    res.json({ success: true, data: kecamatans });
  } catch (err) {
    next(err);
  }
});

export default router;
