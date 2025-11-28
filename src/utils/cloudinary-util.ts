import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary";

// Upload 1 ảnh
export const uploadImage = async (
  filePath: string,
  folder: string = "uploads"
): Promise<{ public_id: string; secure_url: string }> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "image",
    });

    // Xoá file local sau khi upload xong
    // console.log("Deleting local file:", filePath);
    fs.unlinkSync(path.resolve(filePath));

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Upload image failed");
  }
};

// Upload nhiều ảnh
export const uploadMultipleImages = async (
  filePaths: string[],
  folder: string = "uploads"
): Promise<{ public_id: string; secure_url: string }[]> => {
  const uploads: { public_id: string; secure_url: string }[] = [];

  for (const filePath of filePaths) {
    const uploaded = await uploadImage(filePath, folder);
    uploads.push(uploaded);
  }

  return uploads;
};

// Xoá ảnh trên Cloudinary
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
};
