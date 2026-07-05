import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { InventoryItemModel } from "../models/InventoryItem.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
router.use(requireAuth);

const querySchema = z.object({
  businessId: z.string().optional(),
  q: z.string().max(120).optional(),
  low: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

const upsertSchema = z.object({
  businessId: z.string(),
  name: z.string().min(1).max(200),
  sku: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
  qty: z.number().int().min(0),
  threshold: z.number().int().min(0),
  unitPrice: z.number().min(0),
});

router.get(
  "/",
  validate(querySchema, "query"),
  ah(async (req, res) => {
    const { businessId, q, low, page, pageSize } = req.query as unknown as z.infer<typeof querySchema>;
    const filter: Record<string, unknown> = { ownerId: req.user!.sub };
    if (businessId && businessId !== "all") filter.businessId = new Types.ObjectId(businessId);
    if (q) filter.name = { $regex: q, $options: "i" };
    const [items, total] = await Promise.all([
      InventoryItemModel.find(filter).sort({ name: 1 }).skip((page - 1) * pageSize).limit(pageSize).populate("businessId", "name emoji"),
      InventoryItemModel.countDocuments(filter),
    ]);
    const filtered = low ? items.filter((i) => i.qty <= i.threshold) : items;
    res.json({ items: filtered, total, page, pageSize });
  }),
);

router.post(
  "/",
  validate(upsertSchema),
  ah(async (req, res) => {
    const created = await InventoryItemModel.create({ ...req.body, ownerId: req.user!.sub });
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  validate(upsertSchema.partial()),
  ah(async (req, res) => {
    const updated = await InventoryItemModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!.sub },
      req.body,
      { new: true },
    );
    if (!updated) throw new HttpError(404, "Item not found");
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  ah(async (req, res) => {
    const out = await InventoryItemModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.sub });
    if (!out) throw new HttpError(404, "Item not found");
    res.json({ ok: true });
  }),
);

export default router;
