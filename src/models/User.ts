import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "student" | "employer";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: {
    public_id: string;
    secure_url: string;
  };
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },
    role: {
      type: String,
      enum: ["student", "employer"],
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
