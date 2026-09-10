import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "./authenticate";
import { AppError } from "./errorHandler";

/** Allows Pro accounts and admins (admins need access for support/testing). */
export async function requirePro(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) throw new AppError(401, "Authentication required");

    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
      select: { plan: true, role: true, isActive: true },
    });

    if (!profile?.isActive || (profile.plan !== "PRO" && profile.role !== "ADMIN")) {
      throw new AppError(403, "Akun Pro diperlukan untuk mengelola etalase");
    }

    next();
  } catch (err) {
    next(err);
  }
}
