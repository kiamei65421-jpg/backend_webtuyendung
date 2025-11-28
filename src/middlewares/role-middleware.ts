import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth-middleware";

export const checkRole =
  (...roles: ("student" | "employer")[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập tài nguyên này" });
    }

    next();
  };
