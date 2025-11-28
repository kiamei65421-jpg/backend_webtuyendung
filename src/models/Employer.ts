import mongoose, { Schema, Document } from "mongoose";

export interface IEmployer extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  companyAddress?: string;
  website?: string;
  phoneNumber: string;
  description?: string;
  logo?: {
    public_id: string;
    secure_url: string;
  }; // optional nếu bạn cho employer upload logo công ty
  createdAt: Date;
  updatedAt: Date;
}

const employerSchema = new Schema<IEmployer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyAddress: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      match: /^[0-9]{9,11}$/,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    logo: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Employer = mongoose.model<IEmployer>("Employer", employerSchema);
