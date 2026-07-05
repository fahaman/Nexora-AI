import { Schema, model } from "mongoose";

const expenseSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    note: { type: String, default: "", maxlength: 500 },
    amount: { type: Number, required: true, min: 0 },
    occurredAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true },
);

expenseSchema.index({ ownerId: 1, occurredAt: -1 });

export const ExpenseModel = model("Expense", expenseSchema);
