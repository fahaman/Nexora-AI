import { Schema, model } from "mongoose";

const employeeSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 80 },
    salary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Active", "On leave", "Inactive"], default: "Active" },
  },
  { timestamps: true },
);

export const EmployeeModel = model("Employee", employeeSchema);
