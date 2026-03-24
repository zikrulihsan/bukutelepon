import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../utils/supabaseAdmin";

export interface AccessRequest extends Request {
  userId?: string;
  isAuthenticated?: boolean;
  hasContributed?: boolean;
}

export async function checkAccess(
  req: AccessRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  req.isAuthenticated = false;
  req.hasContributed = false;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(token);

    if (user) {
      req.userId = user.id;
      req.isAuthenticated = true;
    }
  }

  next();
}
