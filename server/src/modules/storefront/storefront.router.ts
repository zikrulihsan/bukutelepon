import { Router } from "express";
import { prisma } from "../../utils/prisma";

const router = Router();

// GET /api/storefront/:slug — public, published storefront data only.
router.get("/:slug", async (req, res, next) => {
  try {
    const business = await prisma.business.findFirst({
      where: { slug: req.params.slug as string, status: "ACTIVE" },
      include: {
        items: {
          where: { status: { not: "HIDDEN" } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!business) {
      res.status(404).json({ success: false, message: "Etalase tidak ditemukan" });
      return;
    }

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
});

export default router;
