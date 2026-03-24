import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../utils/supabaseAdmin";
import { AppError } from "./errorHandler";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, "Invalid or expired token");
    }

    req.userId = user.id;
    req.userEmail = user.email;

    next();
  } catch (err) {
    next(err);
  }
}
