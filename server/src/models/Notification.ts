import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tone: { type: String, enum: ["warning", "destructive", "success", "primary"], default: "primary" },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 500 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ ownerId: 1, createdAt: -1 });

export const NotificationModel = model("Notification", notificationSchema);
