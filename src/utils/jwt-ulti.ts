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
    httpOnly: true,
    secure: true, // 🔥 BẮT BUỘC nếu dùng https + domain khác
    sameSite: "none", // 🔥 BẮT BUỘC để cookie gửi sang domain khác
    maxAge: 24 * 60 * 60 * 1000,
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
