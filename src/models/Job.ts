import mongoose, { Schema, Document } from "mongoose";

export type JobType = "fulltime" | "parttime" | "intern";

export interface IJob extends Document {
  owner: mongoose.Types.ObjectId; // Employer ID (hoặc userId nếu employer liên kết với user)
  title: string;
  description: string;
  location?: string;
  salaryFrom?: number;
  salaryTo?: number;
  jobType?: JobType;
  requirements?: string[];
  benefits?: string[];
  deadline?: Date;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    salaryFrom: { type: Number },
    salaryTo: { type: Number },
    jobType: {
      type: String,
      enum: ["fulltime", "parttime", "intern"],
      default: "fulltime",
    },
    requirements: [{ type: String }],
    benefits: [{ type: String }],
    deadline: { type: Date },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text", location: "text" });
jobSchema.index({ owner: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>("Job", jobSchema);
