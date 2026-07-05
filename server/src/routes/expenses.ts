import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { ExpenseModel } from "../models/Expense.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { notifyHighExpense } from "../services/notifications.js";

const router = Router();
router.use(requireAuth);

const HIGH_EXPENSE_THRESHOLD = 50000;

const querySchema = z.object({
  businessId: z.string().optional(),
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const createSchema = z.object({
  businessId: z.string(),
  category: z.string().min(1).max(80),
  note: z.string().max(500).optional(),
  amount: z.number().min(0),
  occurredAt: z.coerce.date().optional(),
});

router.get(
  "/",
  validate(querySchema, "query"),
  ah(async (req, res) => {
    const { businessId, q, page, pageSize } = req.query as unknown as z.infer<typeof querySchema>;
    const filter: Record<string, unknown> = { ownerId: req.user!.sub };
    if (businessId && businessId !== "all") filter.businessId = new Types.ObjectId(businessId);
    if (q) filter.category = { $regex: q, $options: "i" };
    const [items, total] = await Promise.all([
      ExpenseModel.find(filter).sort({ occurredAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).populate("businessId", "name emoji"),
      ExpenseModel.countDocuments(filter),
    ]);
    res.json({ items, total, page, pageSize });
  }),
);

router.post(
  "/",
  validate(createSchema),
  ah(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const created = await ExpenseModel.create({ ...body, ownerId: req.user!.sub });
    if (body.amount >= HIGH_EXPENSE_THRESHOLD) {
      notifyHighExpense(req.user!.sub, body.category, body.amount).catch(() => null);
    }
    res.status(201).json(created);
  }),
);

router.delete(
  "/:id",
  ah(async (req, res) => {
    const out = await ExpenseModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.sub });
    if (!out) throw new HttpError(404, "Expense not found");
    res.json({ ok: true });
  }),
);

export default router;
