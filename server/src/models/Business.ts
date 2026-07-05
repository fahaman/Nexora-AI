import { Schema, model } from "mongoose";

const businessSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    emoji: { type: String, default: "🏢", maxlength: 8 },
    color: { type: String, enum: ["violet", "cyan", "success", "warning"], default: "violet" },
  },
  { timestamps: true },
);

businessSchema.index({ ownerId: 1, name: 1 });

export const BusinessModel = model("Business", businessSchema);
