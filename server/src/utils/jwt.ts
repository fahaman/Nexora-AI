import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type Role = "admin" | "manager" | "employee";
export interface AccessPayload {
  sub: string;
  role: Role;
  email: string;
}

export function signAccess(payload: AccessPayload): string {
  const opts: SignOptions = { expiresIn: env.accessTtl as unknown as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtAccessSecret, opts);
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
}

export function signRefresh(payload: { sub: string; jti: string }): string {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: `${env.refreshTtlDays}d` });
}

export function verifyRefresh(token: string): { sub: string; jti: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string; jti: string };
}
