import { Router, Request } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";

const router = Router();

const GUEST_VIEW_THRESHOLD = parseInt(process.env.GUEST_VIEW_THRESHOLD || "3", 10);

// POST /api/guest/track — track guest contact views via fingerprint
router.post("/track", apiLimiter, async (req: Request, res, next) => {
  try {
    const { fingerprint, contactId } = req.body;

    if (!fingerprint || !contactId) {
      res.status(400).json({ success: false, message: "fingerprint and contactId required" });
      return;
    }

    let session = await prisma.guestSession.findUnique({
      where: { fingerprint },
    });

    if (!session) {
      session = await prisma.guestSession.create({
        data: {
          fingerprint,
          viewedContactIds: [contactId],
          viewCount: 1,
        },
      });
    } else {
      const viewedIds = session.viewedContactIds as string[];

      if (!viewedIds.includes(contactId)) {
        session = await prisma.guestSession.update({
          where: { fingerprint },
          data: {
            viewedContactIds: [...viewedIds, contactId],
            viewCount: { increment: 1 },
          },
        });
      }
    }

    const remaining = Math.max(0, GUEST_VIEW_THRESHOLD - session.viewCount);

    res.json({
      success: true,
      data: {
        viewCount: session.viewCount,
        threshold: GUEST_VIEW_THRESHOLD,
        remaining,
        isLocked: remaining === 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/guest/status/:fingerprint
router.get("/status/:fingerprint", apiLimiter, async (req, res, next) => {
  try {
    const session = await prisma.guestSession.findUnique({
      where: { fingerprint: req.params.fingerprint as string },
    });

    const viewCount = session?.viewCount ?? 0;
    const remaining = Math.max(0, GUEST_VIEW_THRESHOLD - viewCount);

    res.json({
      success: true,
      data: {
        viewCount,
        threshold: GUEST_VIEW_THRESHOLD,
        remaining,
        isLocked: remaining === 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
