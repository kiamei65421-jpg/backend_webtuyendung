import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// =========================
// UPLOAD 1 FILE (BUFFER)
// =========================
export const uploadImage = (
  buffer: Buffer,
  folder: string = "uploads"
): Promise<{ public_id: string; secure_url: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Upload failed"));
        } else {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// =========================
// UPLOAD MULTIPLE FILES
// =========================
export const uploadMultipleImages = async (
  buffers: Buffer[],
  folder: string = "uploads"
): Promise<{ public_id: string; secure_url: string }[]> => {
  const uploadedFiles: { public_id: string; secure_url: string }[] = [];
  for (const buffer of buffers) {
    const uploaded = await uploadImage(buffer, folder);
    uploadedFiles.push(uploaded);
  }
  return uploadedFiles;
};

// =========================
// DELETE FILE
// =========================
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
};
