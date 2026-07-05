import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

type Source = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodSchema<T>, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[source]);
    (req as unknown as Record<string, unknown>)[source] = parsed;
    next();
  };
