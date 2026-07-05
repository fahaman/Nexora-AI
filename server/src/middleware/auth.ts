import type { Request, Response, NextFunction } from "express";
import { verifyAccess, type AccessPayload } from "../utils/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const token = header.slice(7);
  try {
    req.user = verifyAccess(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
