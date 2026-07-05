import { Schema, model } from "mongoose";

const saleSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    inventoryItemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", default: null },
    product: { type: String, required: true, trim: true, maxlength: 200 },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 },
    customer: { type: String, default: "", maxlength: 120 },
    occurredAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true },
);

saleSchema.index({ ownerId: 1, occurredAt: -1 });

export const SaleModel = model("Sale", saleSchema);
