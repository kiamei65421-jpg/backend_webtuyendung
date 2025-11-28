import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  major: string;
  className: string;
  gpa: number;
  description?: string;
  studentId: string;
  cv?: {
    public_id: string;
    secure_url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    gpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    cv: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model<IStudent>("Student", studentSchema);
