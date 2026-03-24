import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "./authenticate";
import { AppError } from "./errorHandler";

export async function requireContribution(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new AppError(401, "Authentication required");
    }

    const profile = await prisma.profile.findUnique({
      where: { id: req.userId },
    });

    if (!profile) {
      throw new AppError(404, "Profile not found");
    }

    // Admins bypass contribution requirement
    if (profile.role === "ADMIN") {
      return next();
    }

    if (!profile.hasContributed) {
      throw new AppError(403, "You must contribute at least one contact to access full directory");
    }

    next();
  } catch (err) {
    next(err);
  }
}
