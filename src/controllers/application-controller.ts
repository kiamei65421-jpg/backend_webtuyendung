import { Request, Response } from "express";
import mongoose from "mongoose";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { User } from "../models/User";
import { Student } from "../models/Student";

/**
 * 🧩 Student apply vào Job
 */
export const applyJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const applicantId = req.user?.userId;

    // 1️⃣ Check job tồn tại & còn hiệu lực
    const job = await Job.findById(jobId);
    if (!job || job.isClosed)
      return res.status(404).json({ message: "Job not available or closed." });

    // 2️⃣ Lấy thông tin user & student profile
    const user = await User.findById(applicantId).lean();
    const studentProfile = await Student.findOne({
      userId: applicantId,
    }).lean();

    if (!user || !studentProfile)
      return res.status(400).json({ message: "Student profile not found." });

    // 3️⃣ Tạo bản ghi Application
    const application = await Application.create({
      job: job._id,
      applicant: applicantId,
      applicantSnapshot: {
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        studentProfile: {
          studentId: studentProfile.studentId,
          major: studentProfile.major,
          gpa: studentProfile.gpa,
        },
      },
      resume: studentProfile.cv, // ✅ CV hiện tại của student
      status: "applied",
    });

    res.status(201).json({
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (err: any) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "Bạn đã ứng tuyển vị trí này rồi ." });
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * 🧩 Student rút (withdraw) đơn ứng tuyển
 */
export const withdrawApplication = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const applicantId = req.user?.userId;

    const application = await Application.findOneAndUpdate(
      { job: jobId, applicant: applicantId },
      { status: "withdrawn" },
      { new: true }
    );

    if (!application)
      return res.status(404).json({ message: "Application not found." });

    res.json({
      message: "Application withdrawn successfully.",
      data: application,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * 🧩 Employer xem danh sách sinh viên apply vào bài đăng của mình
 */
export const getApplicantsForJob = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.id;
    const employerId = req.user?.userId;

    // 1️⃣ Kiểm tra job có thuộc về employer không
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    if (job.owner.toString() !== employerId.toString())
      return res.status(403).json({ message: "Forbidden." });

    // 2️⃣ Lấy danh sách ứng viên
    const applications = await Application.find({ job: jobId })
      .populate("applicant", "username email avatar role") // lấy thông tin user cơ bản
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Applicants fetched successfully.",
      data: applications.map((a) => ({
        _id: a._id,
        status: a.status,
        appliedAt: a.createdAt,
        applicant: a.applicantSnapshot || a.applicant,
        resume: a.resume, //  frontend dùng secure_url để xem CV
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const appId = req.params.appId;
    const employerId = req.user?.userId;
    const { status } = req.body;
    console.log("Status update requested:", status);
    if (!["shortlisted", "rejected", "hired"].includes(status))
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });

    // 1️⃣ Lấy application + job
    const application = await Application.findById(appId).populate("job");
    if (!application)
      return res.status(404).json({ message: "Không tìm thấy đơn ứng tuyển." });

    const job = await Job.findById(application.job);
    if (!job)
      return res.status(404).json({ message: "Không tìm thấy công việc." });

    // 2️⃣ Check quyền
    if (job.owner.toString() !== employerId.toString())
      return res.status(403).json({ message: "Forbidden." });

    // 3️⃣ Cập nhật trạng thái
    application.status = status;
    await application.save();

    res.json({
      message: "Application status updated.",
      data: { id: application._id, status },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

/**
 * 🧩 Employer xem chi tiết 1 applicant (xem CV & info đầy đủ)
 */
export const getApplicantDetail = async (req: Request, res: Response) => {
  try {
    const { id: jobId, appId } = req.params;
    const employerId = req.user?.userId;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    if (job.owner.toString() !== employerId.toString())
      return res.status(403).json({ message: "Forbidden." });

    const application = await Application.findOne({ _id: appId, job: jobId })
      .populate("applicant", "username email avatar")
      .lean();

    if (!application)
      return res.status(404).json({ message: "Application not found." });

    //  Lấy thêm profile student từ DB nếu cần (để xem CV mới nhất)
    const studentProfile = await Student.findOne({
      userId: application.applicant,
    }).lean();

    res.json({
      message: "Applicant detail fetched successfully.",
      data: {
        ...application,
        studentProfile,
        cvUrl:
          studentProfile?.cv?.secure_url ||
          application.resume?.secure_url ||
          null, //  link CV ở đây
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

//  Student xem danh sách các job đã apply
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const applicantId = req.user?.userId;

    const applications = await Application.find({ applicant: applicantId })
      .populate({
        path: "job",
        select: "title location salaryFrom salaryTo jobType owner",
        populate: { path: "owner", select: "avatar username" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      message: "Fetched your applied jobs.",
      data: applications.map((a) => ({
        _id: a._id,
        job: a.job,
        status: a.status,
        appliedAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};
