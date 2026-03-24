import { Router, Request } from "express";
import { prisma } from "../../utils/prisma";
import { apiLimiter } from "../../middleware/rateLimiter";

const router = Router();

const GUEST_VIEW_THRESHOLD = parseInt(process.env.GUEST_VIEW_THRESHOLD || "3", 10);

// POST /api/guest/track — track guest contact views via sessionToken
router.post("/track", apiLimiter, async (req: Request, res, next) => {
  try {
    const { sessionToken, contactId } = req.body;

    if (!sessionToken || !contactId) {
      res.status(400).json({ success: false, message: "sessionToken and contactId required" });
      return;
    }

    let session = await prisma.guestSession.findUnique({
      where: { sessionToken },
    });

    if (!session) {
      session = await prisma.guestSession.create({
        data: {
          sessionToken,
          ipAddress: req.ip ?? null,
          viewCount: 1,
        },
      });
    } else {
      session = await prisma.guestSession.update({
        where: { sessionToken },
        data: {
          viewCount: { increment: 1 },
        },
      });
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

// GET /api/guest/status/:sessionToken
router.get("/status/:sessionToken", apiLimiter, async (req, res, next) => {
  try {
    const session = await prisma.guestSession.findUnique({
      where: { sessionToken: req.params.sessionToken as string },
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
