import { BusinessModel } from "../models/Business.js";
import { InventoryItemModel } from "../models/InventoryItem.js";
import { SaleModel } from "../models/Sale.js";
import { ExpenseModel } from "../models/Expense.js";
import { EmployeeModel } from "../models/Employee.js";
import { NotificationModel } from "../models/Notification.js";

const TEMPLATE = [
  { name: "Saffron Kitchen", category: "Restaurant", emoji: "🍜", color: "warning" as const },
  { name: "Atelier 22", category: "Clothing Shop", emoji: "👗", color: "violet" as const },
  { name: "Northwind Digital", category: "Digital Agency", emoji: "💻", color: "cyan" as const },
  { name: "WellCare Pharma", category: "Medical Store", emoji: "💊", color: "success" as const },
];

export async function seedForUser(ownerId: string) {
  const existing = await BusinessModel.countDocuments({ ownerId });
  if (existing > 0) return;

  const businesses = await BusinessModel.insertMany(TEMPLATE.map((b) => ({ ...b, ownerId })));
  const [rest, cloth, agency, pharma] = businesses;

  await InventoryItemModel.insertMany([
    { ownerId, businessId: rest._id, name: "Saffron Risotto Kit", category: "Food", qty: 8, threshold: 12, unitPrice: 450 },
    { ownerId, businessId: rest._id, name: "Truffle Oil 250ml", category: "Food", qty: 4, threshold: 10, unitPrice: 1800 },
    { ownerId, businessId: cloth._id, name: "Linen Co-ord Set", category: "Apparel", qty: 34, threshold: 10, unitPrice: 3200 },
    { ownerId, businessId: cloth._id, name: "Cashmere Scarf", category: "Apparel", qty: 6, threshold: 8, unitPrice: 4500 },
    { ownerId, businessId: pharma._id, name: "Paracetamol 500mg", category: "OTC", qty: 142, threshold: 40, unitPrice: 30 },
    { ownerId, businessId: pharma._id, name: "Vitamin D3 Drops", category: "OTC", qty: 12, threshold: 20, unitPrice: 280 },
  ]);

  const now = Date.now();
  const day = 86400000;
  await SaleModel.insertMany([
    { ownerId, businessId: rest._id, product: "Tasting Menu × 4", quantity: 1, unitPrice: 4120, amount: 4120, occurredAt: new Date(now - 1 * day) },
    { ownerId, businessId: cloth._id, product: "Linen Co-ord Set", quantity: 1, unitPrice: 3200, amount: 3200, occurredAt: new Date(now - 1 * day) },
    { ownerId, businessId: agency._id, product: "Brand Retainer", quantity: 1, unitPrice: 42000, amount: 42000, occurredAt: new Date(now - 2 * day) },
    { ownerId, businessId: pharma._id, product: "Prescription Refill", quantity: 1, unitPrice: 640, amount: 640, occurredAt: new Date(now - 2 * day) },
  ]);

  await ExpenseModel.insertMany([
    { ownerId, businessId: rest._id, category: "Rent", amount: 32000, occurredAt: new Date(now - 6 * day) },
    { ownerId, businessId: agency._id, category: "Salaries", amount: 118000, occurredAt: new Date(now - 8 * day) },
    { ownerId, businessId: pharma._id, category: "Inventory", amount: 21500, occurredAt: new Date(now - 9 * day) },
    { ownerId, businessId: cloth._id, category: "Electricity", amount: 4100, occurredAt: new Date(now - 10 * day) },
  ]);

  await EmployeeModel.insertMany([
    { ownerId, businessId: rest._id, name: "Aarav Mehta", role: "Head Chef", salary: 48000 },
    { ownerId, businessId: cloth._id, name: "Sana Iqbal", role: "Store Manager", salary: 36000 },
    { ownerId, businessId: agency._id, name: "Leon Whitaker", role: "Creative Lead", salary: 68000 },
    { ownerId, businessId: pharma._id, name: "Priya Raghavan", role: "Pharmacist", salary: 42000, status: "On leave" },
  ]);

  await NotificationModel.insertMany([
    { ownerId, tone: "primary", title: "Welcome to Nexora AI", body: "Your workspace has been seeded with 4 demo businesses." },
    { ownerId, tone: "warning", title: "Low stock: Truffle Oil 250ml", body: "Only 4 left in Saffron Kitchen." },
  ]);
}
