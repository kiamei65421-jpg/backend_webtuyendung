import express from "express";
import * as jobController from "../controllers/job-controller";
import { AuthMiddleware } from "../middlewares/auth-middleware";
import { checkRole } from "../middlewares/role-middleware";

const router = express.Router();

// --- Public routes ---
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);

// --- Employer only ---

router.get(
  "/employer/me",
  AuthMiddleware,
  checkRole("employer"),
  jobController.getMyJobs
);
router.post(
  "/",
  AuthMiddleware,
  checkRole("employer"),
  jobController.createJob
);
router.put(
  "/:id",
  AuthMiddleware,
  checkRole("employer"),
  jobController.updateJob
);
router.delete(
  "/:id",
  AuthMiddleware,
  checkRole("employer"),
  jobController.deleteJob
);

export default router;
