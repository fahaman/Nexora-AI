import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "crypto";
import { UserModel } from "../models/User.js";
import { ProfileModel } from "../models/Profile.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import { signAccess, signRefresh, verifyRefresh } from "../utils/jwt.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { env } from "../config/env.js";
import { seedForUser } from "../services/seed.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).trim(),
  phone: z.string().max(30).trim().optional(),
  countryCode: z.string().max(10).trim().optional(),
  gst: z.string().max(20).trim().optional(),
});

const loginSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(1).max(128),
});

const refreshSchema = z.object({ refreshToken: z.string().min(10) });

async function issueTokens(userId: string, role: "admin" | "manager" | "employee", email: string) {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + env.refreshTtlDays * 86400 * 1000);
  await RefreshTokenModel.create({ userId, jti, expiresAt });
  return {
    accessToken: signAccess({ sub: userId, role, email }),
    refreshToken: signRefresh({ sub: userId, jti }),
  };
}

router.post(
  "/register",
  validate(registerSchema),
  ah(async (req, res) => {
    const { email, password, name, phone, countryCode, gst } = req.body as z.infer<typeof registerSchema>;
    const exists = await UserModel.findOne({ email });
    if (exists) throw new HttpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ email, passwordHash, role: "admin" });
    await ProfileModel.create({
      userId: user._id,
      name,
      phone: phone || "",
      countryCode: countryCode || "",
      gst: gst || "",
    });
    if (env.seedOnRegister) await seedForUser(String(user._id));

    const tokens = await issueTokens(String(user._id), user.role, user.email);
    res.status(201).json({
      user: { id: user._id, email: user.email, role: user.role, name },
      ...tokens,
    });
  }),
);

router.post(
  "/login",
  validate(loginSchema),
  ah(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await UserModel.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");
    const profile = await ProfileModel.findOne({ userId: user._id });
    const tokens = await issueTokens(String(user._id), user.role, user.email);
    res.json({
      user: { id: user._id, email: user.email, role: user.role, name: profile?.name ?? "Owner" },
      ...tokens,
    });
  }),
);

router.post(
  "/refresh",
  validate(refreshSchema),
  ah(async (req, res) => {
    const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
    let payload;
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      throw new HttpError(401, "Invalid refresh token");
    }
    const stored = await RefreshTokenModel.findOne({ jti: payload.jti });
    if (!stored || stored.revokedAt) throw new HttpError(401, "Refresh token revoked");
    if (stored.expiresAt.getTime() < Date.now()) throw new HttpError(401, "Refresh token expired");

    // rotate
    stored.revokedAt = new Date();
    await stored.save();
    const user = await UserModel.findById(payload.sub);
    if (!user) throw new HttpError(401, "User not found");
    const tokens = await issueTokens(String(user._id), user.role, user.email);
    res.json(tokens);
  }),
);

router.post(
  "/logout",
  validate(refreshSchema),
  ah(async (req, res) => {
    const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
    try {
      const payload = verifyRefresh(refreshToken);
      await RefreshTokenModel.updateOne({ jti: payload.jti }, { revokedAt: new Date() });
    } catch {
      /* swallow */
    }
    res.json({ ok: true });
  }),
);

router.get(
  "/me",
  requireAuth,
  ah(async (req, res) => {
    const user = await UserModel.findById(req.user!.sub);
    if (!user) throw new HttpError(404, "User not found");
    const profile = await ProfileModel.findOne({ userId: user._id });
    res.json({
      id: user._id,
      email: user.email,
      role: user.role,
      name: profile?.name ?? "Owner",
      avatarUrl: profile?.avatarUrl ?? "",
      activeBusinessId: profile?.activeBusinessId ?? null,
    });
  }),
);

export default router;
