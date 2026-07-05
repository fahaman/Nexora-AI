import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", issues: err.flatten() });
  }
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    if (status >= 500) console.error(err);
    return res.status(status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
