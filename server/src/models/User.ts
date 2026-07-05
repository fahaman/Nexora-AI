import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager", "employee"], default: "admin", index: true },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema> & { _id: string };
export const UserModel = model("User", userSchema);
