// models/Application.ts
import mongoose, { Schema, Document } from "mongoose";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "hired"
  | "withdrawn";

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  applicantSnapshot?: {
    username?: string;
    email?: string;
    avatar?: { public_id: string; secure_url: string };
    studentProfile?: {
      studentId?: string;
      major?: string;
      gpa?: number;
    };
  };
  resume?: { public_id: string; secure_url: string };
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    applicantSnapshot: {
      username: { type: String },
      email: { type: String },
      avatar: {
        public_id: { type: String },
        secure_url: { type: String },
      },
      studentProfile: {
        studentId: { type: String },
        major: { type: String },
        gpa: { type: Number },
      },
    },
    resume: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired", "withdrawn"],
      default: "applied",
    },
  },
  { timestamps: true } // ✅ tạo auto createdAt, updatedAt
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);
