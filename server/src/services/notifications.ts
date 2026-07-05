import { NotificationModel } from "../models/Notification.js";

export async function notifyLowStock(ownerId: string, productName: string, qty: number) {
  await NotificationModel.create({
    ownerId,
    tone: "warning",
    title: `Low stock: ${productName}`,
    body: `Only ${qty} left. Restock soon to avoid lost sales.`,
  });
}

export async function notifyHighExpense(ownerId: string, category: string, amount: number) {
  await NotificationModel.create({
    ownerId,
    tone: "destructive",
    title: `High expense alert — ${category}`,
    body: `An expense of ${amount.toLocaleString()} was just recorded.`,
  });
}

export async function notifyInfo(ownerId: string, title: string, body = "") {
  await NotificationModel.create({ ownerId, tone: "primary", title, body });
}
