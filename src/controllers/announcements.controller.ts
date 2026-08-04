import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs/promises";

import prisma from "../../prisma/client.ts";
import { Prisma } from "../../generated/prisma/browser.ts";
import {
  AnnouncementBody,
  AnnouncementParams,
  GetAnnouncementsQuery,
} from "../validators/announcements.validator.ts";
import logger from "../logger.ts";
import { connect } from "http2";

const limit = 10; // Number of announcements per page

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ dest: "tmp/" });

export const getAllAnnouncements = async (req: Request, res: Response) => {
  const { page = 1, sort, search } = res.locals.query;

  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.AnnouncementWhereInput = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  const orderBy: Prisma.AnnouncementOrderByWithRelationInput = {
    createdAt: sort === "oldest" ? "asc" : "desc",
  };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: {
          select: { id: true, name: true, email: true, username: true },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  res.status(200).json({
    data: announcements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getAnnouncementById = async (
  req: Request<AnnouncementParams>,
  res: Response,
) => {
  const { id } = req.params;
  const announcement = await prisma.announcement.findUnique({
    where: { id: Number(id) },
    include: {
      author: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
  });

  if (!announcement) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  res.status(200).json(announcement);
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, description, price, category } = req.body;
  let imageUrl: string | null = null;

  // if passed file, upload to Cloudinary and get the URL
  if (req.file) {
    try {
      // 1. Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements", // Folder inside your Cloudinary
      });
      imageUrl = result.secure_url;
    } finally {
      // 2. Delete local file regardless of upload success
      await fs.unlink(req.file.path).catch(console.error);
    }
  }

  // 3. Save to database
  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      price,
      category,
      imageUrl,
      authorId: Number(req.user!.sub),
    },
  });

  res.status(201).json(announcement);
};

export const updateAnnouncement = async (
  req: Request<AnnouncementParams, {}, AnnouncementBody>,
  res: Response,
) => {
  const hasTextData = Object.keys(req.body).length > 0;
  const hasFile = !!req.file;

  if (!hasTextData && !hasFile) {
    return res.status(400).json({
      error: "Bad Request",
      message: "At least one field or image must be provided for update",
    });
  }

  const { id } = req.params;
  const { title, description, price, category } = req.body;

  let imageUrl: string | undefined = undefined;

  // if passed file, upload to Cloudinary and get the URL
  if (req.file) {
    try {
      // 1. Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements", // Folder inside your Cloudinary
      });
      imageUrl = result.secure_url;
    } finally {
      // 2. Delete local file regardless of upload success
      await fs.unlink(req.file.path).catch(console.error);
    }
  }

  const existingAnnouncement = await prisma.announcement.findUnique({
    where: { id },
  });
  if (!existingAnnouncement) {
    return res.status(404).json({ message: `Announcement not found` });
  }
  if (existingAnnouncement.authorId !== Number(req.user?.sub)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      title,
      description,
      price,
      category,
      imageUrl,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, username: true },
      },
    },
  });

  res.status(200).json(announcement);
};

export const deleteAnnouncement = async (
  req: Request<AnnouncementParams>,
  res: Response,
) => {
  const { id } = req.params;
  const existingAnnouncement = await prisma.announcement.findUnique({
    where: { id },
  });
  if (!existingAnnouncement) {
    return res.status(404).json({ message: "Announcement not found" });
  }
  if (existingAnnouncement.authorId !== Number(req.user?.sub)) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(204).send().end();
};
