import express from "express";
import upload from "../middlewares/multer-middleware";
import { AuthMiddleware } from "../middlewares/auth-middleware";
import { checkRole } from "../middlewares/role-middleware";
import {
  changeAvatar,
  updateStudentProfile,
  updateEmployerProfile,
} from "../controllers/user-controller";

const router = express.Router();
console.log("✅ User routes loaded"); // 👈 thêm dòng này ở đầu file

/**
 * Đổi avatar người dùng (mọi role)
 */
router.patch("/avatar", AuthMiddleware, upload.single("avatar"), changeAvatar);

/**
 * Sinh viên cập nhật hồ sơ (bao gồm CV)
 */
router.patch(
  "/profile/student",
  AuthMiddleware,
  checkRole("student"),
  upload.single("cv"),
  updateStudentProfile
);

/**
 * Nhà tuyển dụng cập nhật hồ sơ
 */
router.patch(
  "/profile/employer",
  AuthMiddleware,
  checkRole("employer"),
  updateEmployerProfile
);

export default router;
