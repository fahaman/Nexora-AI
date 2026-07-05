import { Schema, model } from "mongoose";

const profileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    avatarUrl: { type: String, default: "" },
    phone: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    gst: { type: String, default: "" },
    activeBusinessId: { type: Schema.Types.ObjectId, ref: "Business", default: null },
  },
  { timestamps: true },
);

export const ProfileModel = model("Profile", profileSchema);
