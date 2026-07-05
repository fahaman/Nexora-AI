import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { SaleModel } from "../models/Sale.js";
import { InventoryItemModel } from "../models/InventoryItem.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { notifyLowStock } from "../services/notifications.js";

const router = Router();
router.use(requireAuth);

const querySchema = z.object({
  businessId: z.string().optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  businessId: z.string(),
  inventoryItemId: z.string().nullable().optional(),
  product: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(10000),
  unitPrice: z.number().min(0),
  customer: z.string().max(120).optional(),
  occurredAt: z.coerce.date().optional(),
});

router.get(
  "/",
  validate(querySchema, "query"),
  ah(async (req, res) => {
    const { businessId, q, page, pageSize } = req.query as unknown as z.infer<typeof querySchema>;
    const filter: Record<string, unknown> = { ownerId: req.user!.sub };
    if (businessId && businessId !== "all") filter.businessId = new Types.ObjectId(businessId);
    if (q) filter.product = { $regex: q, $options: "i" };
    const [items, total] = await Promise.all([
      SaleModel.find(filter).sort({ occurredAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).populate("businessId", "name emoji"),
      SaleModel.countDocuments(filter),
    ]);
    res.json({ items, total, page, pageSize });
  }),
);

router.post(
  "/",
  validate(createSchema),
  ah(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const amount = body.quantity * body.unitPrice;

    // Atomic stock decrement if inventory item given — prevents negative stock
    if (body.inventoryItemId) {
      const updated = await InventoryItemModel.findOneAndUpdate(
        {
          _id: body.inventoryItemId,
          ownerId: req.user!.sub,
          qty: { $gte: body.quantity },
        },
        { $inc: { qty: -body.quantity } },
        { new: true },
      );
      if (!updated) throw new HttpError(409, "Insufficient stock");
      if (updated.qty <= updated.threshold) {
        notifyLowStock(req.user!.sub, updated.name, updated.qty).catch(() => null);
      }
    }

    const sale = await SaleModel.create({
      ownerId: req.user!.sub,
      businessId: body.businessId,
      inventoryItemId: body.inventoryItemId ?? null,
      product: body.product,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      amount,
      customer: body.customer ?? "",
      occurredAt: body.occurredAt ?? new Date(),
    });
    res.status(201).json(sale);
  }),
);

router.delete(
  "/:id",
  ah(async (req, res) => {
    const out = await SaleModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.sub });
    if (!out) throw new HttpError(404, "Sale not found");
    res.json({ ok: true });
  }),
);

export default router;
