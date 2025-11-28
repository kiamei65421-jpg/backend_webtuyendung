import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ Missing Cloudinary environment variables");
  process.exit(1);
} else {
  console.log("✅ Cloudinary environment variables loaded");
  console.log(`Cloud Name: ${cloudName}`);
  console.log(`API Key: ${apiKey}`);
  console.log(`API Secret: ${apiSecret}`);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true, // recommended in prod
});

export default cloudinary;
