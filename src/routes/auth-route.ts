// src/routes/auth-routes.ts
import express from "express";
import { AuthMiddleware } from "../middlewares/auth-middleware";
import {
  changePassword,
  getProfile,
  login,
  logout,
  register,
} from "../controllers/auth-controller";
import { checkRole } from "../middlewares/role-middleware";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.patch("/change-password", AuthMiddleware, changePassword);
router.get("/profile", AuthMiddleware, getProfile);
router.get("/he", (req: any, res: any) => {
  return res.status(200).json({ message: "Ok" });
});

// Test phân quyền
router.get(
  "/test/student",
  AuthMiddleware,
  checkRole("student"),
  (req, res) => {
    res.json({ message: "Chào sinh viên, bạn có quyền truy cập route này." });
  }
);

router.get(
  "/test/employer",
  AuthMiddleware,
  checkRole("employer"),
  (req, res) => {
    res.json({
      message: "Chào nhà tuyển dụng, bạn có quyền truy cập route này.",
    });
  }
);
export default router;
