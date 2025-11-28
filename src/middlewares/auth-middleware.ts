import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt-ulti";
export interface AuthRequest extends Request {
  user?: { userId: string; role: "student" | "employer" };
}

export const AuthMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập" });

  const decoded = verifyToken(token);
  if (!decoded)
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });

  req.user = decoded;
  next();
};
