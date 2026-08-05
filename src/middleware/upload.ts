import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary.ts";
import createHttpError from "http-errors";

// check if uploads directory exists, if not create it
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File type filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      createHttpError(
        400,
        "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      ),
    );
  }
};

// create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware to upload file to Cloudinary and add the URL to req.body
export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.file) {
    return next();
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "announcements",
      resource_type: "image",
    });
    console.log("uploadToCloudinary middleware called", result.secure_url);
    // Add URL to req.body
    res.locals.imageUrl = result.secure_url;
    // Delete local file
    fs.unlinkSync(req.file.path);

    next();
  } finally {
    // Delete local file in case of error
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
};
