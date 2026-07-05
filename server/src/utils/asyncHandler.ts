import type { Request, Response, NextFunction, RequestHandler } from "express";

export const ah =
  <T extends Request = Request>(fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req as T, res, next).catch(next);
  };
