import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createAccessToken, sendTokenAsCookie } from "../utils/jwt-ulti";
import { User } from "../models/User";
import { Student } from "../models/Student";
import { Employer } from "../models/Employer";
import { AuthRequest } from "../middlewares/auth-middleware";

// =======================
// Đăng ký
// =======================
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, ...extra } = req.body;

    // Kiểm tra role hợp lệ
    if (!["student", "employer"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ!" });
    }

    // Kiểm tra email trùng
    const existed = await User.findOne({ email });
    if (existed) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    // Tạo thông tin chi tiết cho từng role
    if (role === "student") {
      await Student.create({
        userId: user._id,
        major: extra.major,
        className: extra.className,
        gpa: extra.gpa,
        description: extra.description || "",
        studentId: extra.studentId,
      });
    } else if (role === "employer") {
      await Employer.create({
        userId: user._id,
        companyName: extra.companyName,
        companyAddress: extra.companyAddress,
        website: extra.website,
        phoneNumber: extra.phoneNumber,
      });
    }

    const token = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    sendTokenAsCookie(res, token);

    return res.status(201).json({
      message: "Đăng ký thành công!",
      user: { id: user._id, username, email, role },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({
        message: "Lỗi server khi đăng ký thế mới ảo",
        error: error.message,
      });
  }
};

// =======================
// Đăng nhập
// =======================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Sai email hoặc mật khẩu!" });

    const token = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    sendTokenAsCookie(res, token);

    return res.status(200).json({
      message: "Đăng nhập thành công!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

// =======================
// Lấy thông tin profile (từ JWT cookie)
// =======================
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user; // sẽ được gán từ middleware
    if (!user) return res.status(401).json({ message: "Chưa đăng nhập" });

    const baseUser = await User.findById(user.userId).select("-password");

    if (!baseUser)
      return res.status(404).json({ message: "Không tìm thấy user" });

    let detail = null;
    if (baseUser.role === "student") {
      detail = await Student.findOne({ userId: baseUser._id });
    } else {
      detail = await Employer.findOne({ userId: baseUser._id });
    }

    return res.status(200).json({
      message: "Lấy profile thành công",
      user: baseUser,
      detail,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy profile" });
  }
};
// =======================
// Đăng xuất
// =======================
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Lỗi server khi đăng xuất" });
  }
};

/**
 * Đổi mật khẩu
 * @route PATCH /api/auth/change-password
 * @access Private
 * Body: { oldPassword: string, newPassword: string, confirmPassword?: string }
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });

    const userId = req.user.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body as {
      oldPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    // Basic validation
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Cần cung cấp mật khẩu cũ và mật khẩu mới" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải ít nhất 6 ký tự" });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    // Optional: không cho đặt mật khẩu mới giống mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải khác mật khẩu hiện tại" });
    }

    // Hash và cập nhật mật khẩu
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Option A: Tự động cấp token mới và gửi lại cookie (user vẫn remain logged in)
    const newToken = createAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    sendTokenAsCookie(res, newToken);

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Lỗi server khi đổi mật khẩu" });
  }
};
