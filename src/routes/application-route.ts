import express from "express";
import {
  applyJob,
  withdrawApplication,
  getApplicantsForJob,
  getApplicantDetail,
  updateApplicationStatus,
  getMyApplications,
} from "../controllers/application-controller";
import { AuthMiddleware } from "../middlewares/auth-middleware";
import { checkRole } from "../middlewares/role-middleware";

const router = express.Router();

// 🧩 Student
router.post("/:id/apply", AuthMiddleware, checkRole("student"), applyJob);
router.delete(
  "/:id/apply",
  AuthMiddleware,
  checkRole("student"),
  withdrawApplication
);
router.get("/mine", AuthMiddleware, checkRole("student"), getMyApplications);

// 🧩 Employer
router.get(
  "/:id/applicants",
  AuthMiddleware,
  checkRole("employer"),
  getApplicantsForJob
);
router.get(
  "/:id/applicants/:appId",
  AuthMiddleware,
  checkRole("employer"),
  getApplicantDetail
);
router.patch(
  "/:appId/status",
  AuthMiddleware,
  checkRole("employer"),
  updateApplicationStatus
);

export default router;
