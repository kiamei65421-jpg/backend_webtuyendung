import { Request, Response } from "express";
import { Job } from "../models/Job";
import mongoose from "mongoose";

// [GET] /api/jobs
// ✅ Lấy danh sách job, có filter, phân trang, tìm kiếm
export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      keyword,
      location,
      jobType,
      ownerId,
      isClosed,
    } = req.query as any;

    const filter: any = {};

    if (keyword) {
      filter.$text = { $search: keyword }; // dùng text index
    }
    if (location) filter.location = new RegExp(location, "i");
    if (jobType) filter.jobType = jobType;
    if (ownerId) filter.owner = new mongoose.Types.ObjectId(ownerId);
    if (isClosed !== undefined) filter.isClosed = isClosed === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("owner", "username email role avatar")
        .lean(),
      Job.countDocuments(filter),
    ]);

    res.json({
      data: jobs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// [GET] /api/jobs/:id
// ✅ Lấy chi tiết 1 job
export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "owner",
      "username email role avatar"
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};

// [POST] /api/jobs
// ✅ Tạo job mới (chỉ employer)
export const createJob = async (req: Request, res: Response) => {
  try {
    const ownerId = req.user?.userId; // lấy từ middleware auth

    const newJob = new Job({
      ...req.body,
      owner: ownerId,
    });
    const saved = await newJob.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /api/jobs/:id
// ✅ Cập nhật job (chỉ chủ sở hữu)
export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.owner.toString() !== req.user?.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this job" });
    }

    Object.assign(job, req.body);
    const updated = await job.save();
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// [DELETE] /api/jobs/:id
// ✅ Xóa job (hoặc đóng job)
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.owner.toString() !== req.user?.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this job" });
    }

    // Soft delete: mark isClosed = true
    job.isClosed = true;
    await job.save();

    res.json({ message: "Job closed successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyJobs = async (req: Request, res: Response) => {
  try {
    const user = req.user; // gán từ authMiddleware
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // ✅ Lọc theo employer hiện tại
    const jobs = await Job.find({ owner: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Fetched jobs created by current employer.",
      data: jobs,
    });
  } catch (err) {
    console.error("Error fetching my jobs:", err);
    res.status(500).json({ message: "Server error" });
  }
};
