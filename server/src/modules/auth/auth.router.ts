import { Router } from "express";
import { authLimiter } from "../../middleware/rateLimiter";
import { sanitize } from "../../middleware/sanitize";
import { authenticate, AuthenticatedRequest } from "../../middleware/authenticate";
import { prisma } from "../../utils/prisma";
import { z } from "zod";
import { AppError } from "../../middleware/errorHandler";
import { supabaseAdmin } from "../../utils/supabaseAdmin";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

// POST /api/auth/register
router.post("/register", authLimiter, sanitize, async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (error) {
      throw new AppError(400, error.message);
    }

    await prisma.profile.create({
      data: {
        id: data.user.id,
        email,
        name,
        role: "USER",
        hasContributed: false,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
    });

    if (!profile) {
      throw new AppError(404, "Profile not found");
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

export default router;
