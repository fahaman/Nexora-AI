import { Schema, model } from "mongoose";

const inventoryItemSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    sku: { type: String, default: "", trim: true, maxlength: 80 },
    category: { type: String, default: "General", maxlength: 80 },
    qty: { type: Number, required: true, min: 0, default: 0 },
    threshold: { type: Number, required: true, min: 0, default: 5 },
    unitPrice: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true },
);

inventoryItemSchema.index({ ownerId: 1, businessId: 1, name: 1 });

export const InventoryItemModel = model("InventoryItem", inventoryItemSchema);
