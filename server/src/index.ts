import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import businessRoutes from "./routes/businesses.js";
import salesRoutes from "./routes/sales.js";
import expensesRoutes from "./routes/expenses.js";
import inventoryRoutes from "./routes/inventory.js";
import employeesRoutes from "./routes/employees.js";
import notificationsRoutes from "./routes/notifications.js";
import dashboardRoutes from "./routes/dashboard.js";
import { UserModel } from "./models/User.js";
import { ProfileModel } from "./models/Profile.js";
import { errorHandler, notFound } from "./middleware/error.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (
        env.corsOrigins.includes("*") ||
        env.corsOrigins.includes(origin) ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return cb(null, true);
      }
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

async function seedAdminUser() {
  const email = "admin@nexora.com";
  const password = "Admin@2026";
  const user = await UserModel.findOne({ email });
  if (!user) {
    console.log("[seed] Seeding default admin user...");
    const passwordHash = await bcrypt.hash(password, 12);
    const adminUser = await UserModel.create({ email, passwordHash, role: "admin" });
    await ProfileModel.create({
      userId: adminUser._id,
      name: "System Admin",
      phone: "",
      countryCode: "",
      gst: ""
    });
    console.log("[seed] Default admin user seeded successfully.");
  }
}

connectDb()
  .then(async () => {
    await seedAdminUser();
    app.listen(env.port, () => console.log(`[api] listening on :${env.port}`));
  })
  .catch((err) => {
    console.error("[db] connection failed", err);
    process.exit(1);
  });
