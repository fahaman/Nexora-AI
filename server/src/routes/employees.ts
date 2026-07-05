import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { EmployeeModel } from "../models/Employee.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { HttpError } from "../middleware/error.js";

const router = Router();
router.use(requireAuth);

const querySchema = z.object({
  businessId: z.string().optional(),
  q: z.string().max(120).optional(),
});

const upsertSchema = z.object({
  businessId: z.string(),
  name: z.string().min(1).max(120),
  role: z.string().min(1).max(80),
  salary: z.number().min(0),
  status: z.enum(["Active", "On leave", "Inactive"]).optional(),
});

router.get(
  "/",
  validate(querySchema, "query"),
  ah(async (req, res) => {
    const { businessId, q } = req.query as unknown as z.infer<typeof querySchema>;
    const filter: Record<string, unknown> = { ownerId: req.user!.sub };
    if (businessId && businessId !== "all") filter.businessId = new Types.ObjectId(businessId);
    if (q) filter.name = { $regex: q, $options: "i" };
    const items = await EmployeeModel.find(filter).populate("businessId", "name emoji");
    res.json({ items });
  }),
);

router.post(
  "/",
  requireRole("admin", "manager"),
  validate(upsertSchema),
  ah(async (req, res) => {
    const created = await EmployeeModel.create({ ...req.body, ownerId: req.user!.sub });
    res.status(201).json(created);
  }),
);

router.put(
  "/:id",
  requireRole("admin", "manager"),
  validate(upsertSchema.partial()),
  ah(async (req, res) => {
    const updated = await EmployeeModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user!.sub },
      req.body,
      { new: true },
    );
    if (!updated) throw new HttpError(404, "Employee not found");
    res.json(updated);
  }),
);

router.delete(
  "/:id",
  requireRole("admin"),
  ah(async (req, res) => {
    const out = await EmployeeModel.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.sub });
    if (!out) throw new HttpError(404, "Employee not found");
    res.json({ ok: true });
  }),
);

export default router;
