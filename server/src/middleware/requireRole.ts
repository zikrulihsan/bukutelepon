import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "./authenticate";
import { AppError } from "./errorHandler";

export function requireRole(...roles: string[]) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new AppError(401, "Authentication required");
      }

      const profile = await prisma.profile.findUnique({
        where: { id: req.userId },
      });

      if (!profile || !roles.includes(profile.role)) {
        throw new AppError(403, "Insufficient permissions");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
