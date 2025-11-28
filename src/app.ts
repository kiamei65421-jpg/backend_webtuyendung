import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db";

import authRoute from "./routes/auth-route";
import userRoute from "./routes/user-route";
import jobRoute from "./routes/job-route";
import applicationRoute from "./routes/application-route";

const app = express();

// ============ Middlewares ============
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // domain FE
    credentials: true, // cho phép gửi cookie
  })
);

// ============ Database ============
connectDB();

// ============ Routes ============
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/applications", applicationRoute);
// ============ Root test route ============

app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ============ Error Handler (optional) ============
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Đã xảy ra lỗi trên server" });
  }
);

// ============ Start Server ============
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
