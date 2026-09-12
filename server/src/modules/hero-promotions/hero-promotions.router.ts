import { Router } from "express";
import { prisma } from "../../utils/prisma";

const router = Router();

// GET /api/hero-promotions — the public homepage only receives active slides.
router.get("/", async (_req, res, next) => {
  try {
    const promotions = await prisma.heroPromotion.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: promotions });
  } catch (err) {
    next(err);
  }
});

export default router;
