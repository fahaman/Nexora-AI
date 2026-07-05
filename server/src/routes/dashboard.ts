import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { SaleModel } from "../models/Sale.js";
import { ExpenseModel } from "../models/Expense.js";
import { BusinessModel } from "../models/Business.js";
import { InventoryItemModel } from "../models/InventoryItem.js";
import { EmployeeModel } from "../models/Employee.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const querySchema = z.object({ businessId: z.string().optional() });

router.get(
  "/",
  validate(querySchema, "query"),
  ah(async (req, res) => {
    const ownerId = new Types.ObjectId(req.user!.sub);
    const { businessId } = req.query as unknown as z.infer<typeof querySchema>;
    const bizFilter: Record<string, unknown> = { ownerId };
    if (businessId && businessId !== "all") bizFilter.businessId = new Types.ObjectId(businessId);

    const now = new Date();
    const startThis = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startYear = new Date(now.getFullYear(), 0, 1);

    const [revAgg, expAgg, revThis, revPrev, businessesCount, employeesCount, inventoryCount, monthly] = await Promise.all([
      SaleModel.aggregate([{ $match: bizFilter }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
      ExpenseModel.aggregate([{ $match: bizFilter }, { $group: { _id: null, sum: { $sum: "$amount" } } }]),
      SaleModel.aggregate([
        { $match: { ...bizFilter, occurredAt: { $gte: startThis } } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]),
      SaleModel.aggregate([
        { $match: { ...bizFilter, occurredAt: { $gte: startPrev, $lt: startThis } } },
        { $group: { _id: null, sum: { $sum: "$amount" } } },
      ]),
      BusinessModel.countDocuments({ ownerId }),
      EmployeeModel.countDocuments(bizFilter),
      InventoryItemModel.countDocuments(bizFilter),
      SaleModel.aggregate([
        { $match: { ...bizFilter, occurredAt: { $gte: startYear } } },
        {
          $group: {
            _id: { m: { $month: "$occurredAt" } },
            sales: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.m": 1 } },
      ]),
    ]);

    const monthlyExp = await ExpenseModel.aggregate([
      { $match: { ...bizFilter, occurredAt: { $gte: startYear } } },
      { $group: { _id: { m: { $month: "$occurredAt" } }, expenses: { $sum: "$amount" } } },
    ]);

    const expMap = new Map(monthlyExp.map((m) => [m._id.m as number, m.expenses as number]));
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const series = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const sales = monthly.find((x) => x._id.m === m)?.sales ?? 0;
      const expenses = expMap.get(m) ?? 0;
      return { month: monthNames[i], sales, expenses, profit: sales - expenses };
    });

    const revenue = revAgg[0]?.sum ?? 0;
    const expenses = expAgg[0]?.sum ?? 0;
    const profit = revenue - expenses;
    const thisM = revThis[0]?.sum ?? 0;
    const prevM = revPrev[0]?.sum ?? 0;
    const growth = prevM > 0 ? +(((thisM - prevM) / prevM) * 100).toFixed(1) : thisM > 0 ? 100 : 0;

    const byBiz = await SaleModel.aggregate([
      { $match: { ownerId } },
      { $group: { _id: "$businessId", value: { $sum: "$amount" } } },
      { $lookup: { from: "businesses", localField: "_id", foreignField: "_id", as: "biz" } },
      { $unwind: "$biz" },
      { $project: { name: "$biz.name", value: 1, _id: 0 } },
    ]);

    res.json({
      kpis: { revenue, expenses, profit, growth, employees: employeesCount, inventory: inventoryCount, businesses: businessesCount },
      series,
      categoryShare: byBiz,
    });
  }),
);

export default router;
