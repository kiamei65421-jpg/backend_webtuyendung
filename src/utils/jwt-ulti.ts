import jwt from "jsonwebtoken";
import { Response } from "express";

const ACCESS_TOKEN_EXPIRE = "1d"; // 1 ngày

export interface JwtPayload {
  userId: string;
  role: "student" | "employer";
}

export const createAccessToken = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRE,
  });
};

// Gửi token vào cookie an toàn
export const sendTokenAsCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true, // không cho JS phía client đọc
    secure: process.env.NODE_ENV === "production", // chỉ HTTPS nếu production
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  });
};

// Xác minh token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
};
