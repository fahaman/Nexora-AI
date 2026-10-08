import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { ProfileModel } from "../models/Profile.js";
import { BusinessModel } from "../models/Business.js";
import { SaleModel } from "../models/Sale.js";
import { ExpenseModel } from "../models/Expense.js";
import { EmployeeModel } from "../models/Employee.js";
import { InventoryItemModel } from "../models/InventoryItem.js";
import { NotificationModel } from "../models/Notification.js";
import { RefreshTokenModel } from "../models/RefreshToken.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { ah } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { seedForUser } from "../services/seed.js";

const router = Router();

// Middleware to restrict access to ONLY admin@nexora.com
router.use(requireAuth, (req, res, next) => {
  if (req.user?.email !== "admin@nexora.com") {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
  next();
});

const addUserSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).trim(),
  role: z.enum(["admin", "manager", "employee"]),
  phone: z.string().max(30).trim().optional(),
  countryCode: z.string().max(10).trim().optional(),
  gst: z.string().max(20).trim().optional(),
});

// Add user endpoint
router.post(
  "/users",
  validate(addUserSchema),
  ah(async (req, res) => {
    const { email, password, name, role, phone, countryCode, gst } = req.body as z.infer<
      typeof addUserSchema
    >;

    const exists = await UserModel.findOne({ email });
    if (exists) throw new HttpError(409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ email, passwordHash, role });

    await ProfileModel.create({
      userId: user._id,
      name,
      phone: phone || "",
      countryCode: countryCode || "",
      gst: gst || "",
    });

    // Seed mock data for the newly registered user/admin so they have pre-populated stats
    await seedForUser(String(user._id));

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      name,
    });
  }),
);

// Delete user endpoint
router.delete(
  "/users/:id",
  ah(async (req, res) => {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) throw new HttpError(404, "User not found");
    if (user.email === "admin@nexora.com") {
      throw new HttpError(400, "Cannot delete the master admin account");
    }

    // Cascade delete everything associated with this user
    await ProfileModel.deleteOne({ userId: id });
    await RefreshTokenModel.deleteMany({ userId: id });
    await BusinessModel.deleteMany({ ownerId: id });
    await SaleModel.deleteMany({ ownerId: id });
    await ExpenseModel.deleteMany({ ownerId: id });
    await EmployeeModel.deleteMany({ ownerId: id });
    await InventoryItemModel.deleteMany({ ownerId: id });
    await NotificationModel.deleteMany({ ownerId: id });
    await UserModel.deleteOne({ _id: id });

    res.json({ ok: true });
  }),
);

// Dashboard stats endpoint
router.get(
  "/dashboard",
  ah(async (req, res) => {
    const totalUsers = await UserModel.countDocuments();
    const totalBusinesses = await BusinessModel.countDocuments();

    // Fetch all users
    const users = await UserModel.find({}, { passwordHash: 0 }).lean();

    // Fetch all profiles
    const profiles = await ProfileModel.find({}).lean();

    // Fetch all businesses
    const businesses = await BusinessModel.find({}).lean();

    // Fetch all sales and expenses
    const sales = await SaleModel.find({}).lean();
    const expenses = await ExpenseModel.find({}).lean();

    // Combine user details with profiles
    const userList = users.map((user) => {
      const profile = profiles.find((p) => String(p.userId) === String(user._id));
      return {
        id: user._id,
        email: user.email,
        role: user.role,
        createdAt: (user as any).createdAt,
        name: profile?.name ?? "N/A",
        phone: profile?.phone ?? "",
        countryCode: profile?.countryCode ?? "",
        gst: profile?.gst ?? "",
      };
    });

    // Combine business details with owners and calculate health status
    const businessList = businesses.map((biz) => {
      const owner = users.find((u) => String(u._id) === String(biz.ownerId));

      const bizSales = sales
        .filter((s) => String(s.businessId) === String(biz._id))
        .reduce((a, s) => a + s.amount, 0);
      const bizExpenses = expenses
        .filter((e) => String(e.businessId) === String(biz._id))
        .reduce((a, e) => a + e.amount, 0);

      const profit = bizSales - bizExpenses;
      // Doing well if profit is positive and has sales. Otherwise needs consultancy.
      const status = bizSales > 0 && profit > 0 ? "Doing Well" : "Needs Consultancy";

      return {
        id: biz._id,
        name: biz.name,
        category: biz.category,
        emoji: biz.emoji,
        color: biz.color,
        createdAt: (biz as any).createdAt,
        ownerEmail: owner?.email ?? "Unknown",
        revenue: bizSales,
        expenses: bizExpenses,
        profit,
        status,
      };
    });

    const running = businessList.length;
    const doingWell = businessList.filter((b) => b.status === "Doing Well").length;
    const needsConsultancy = businessList.filter((b) => b.status === "Needs Consultancy").length;

    res.json({
      stats: {
        totalUsers,
        totalBusinesses,
        running,
        doingWell,
        needsConsultancy,
      },
      users: userList,
      businesses: businessList,
    });
  }),
);

export default router;
