import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";

const router = Router();

// GET /api/categories/version — lightweight version check for local cache
router.get("/version", apiLimiter, async (_req, res, next) => {
  try {
    const row = await prisma.collectionVersion.findUnique({ where: { key: "categories" } });
    res.json({ success: true, version: row?.version ?? 0 });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories
router.get("/", apiLimiter, async (_req, res, next) => {
  try {
    const [categories, versionRow] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { contacts: true } },
        },
      }),
      prisma.collectionVersion.findUnique({ where: { key: "categories" } }),
    ]);

    res.json({ success: true, data: categories, version: versionRow?.version ?? 0 });
  } catch (err) {
    next(err);
  }
});

export default router;
