import { Router } from "express";
import { z } from "zod";
import { BusinessModel } from "../models/Business.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
router.use(requireAuth);

const upsertSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  emoji: z.string().max(8).optional(),
  color: z.enum(["violet", "cyan", "success", "warning"]).optional(),
});

router.get(
  "/",
  ah(async (req, res) => {
    const items = await BusinessModel.find({ ownerId: req.user!.sub }).sort({ createdAt: 1 });
    res.json({ items });
  }),
);

router.post(
  "/",
  validate(upsertSchema),
  ah(async (req, res) => {
    const created = await BusinessModel.create({ ...req.body, ownerId: req.user!.sub });
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  validate(upsertSchema.partial()),
  ah(async (req, res) => {
    const updated = await BusinessModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!.sub },
      req.body,
      { new: true },
    );
    if (!updated) throw new HttpError(404, "Business not found");
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  ah(async (req, res) => {
    const out = await BusinessModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.sub });
    if (!out) throw new HttpError(404, "Business not found");
    res.json({ ok: true });
  }),
);

export default router;
