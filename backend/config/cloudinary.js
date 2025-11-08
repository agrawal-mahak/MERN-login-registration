import { v2 as cloudinary } from "cloudinary";

const requiredEnvVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length) {
  console.warn(
    `Cloudinary environment variables missing: ${missingVars.join(", ")}. Image uploads will fail until these are configured.`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file, options = {}) => {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const base64File = file.buffer.toString("base64");
  const uploadStr = `data:${file.mimetype};base64,${base64File}`;

  return cloudinary.uploader.upload(uploadStr, {
    folder: "posts",
    resource_type: "image",
    ...options,
  });
};

export const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
