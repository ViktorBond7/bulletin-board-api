import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import { Prisma } from "../../generated/prisma/browser.ts";
import {
  AnnouncementBody,
  AnnouncementParams,
  GetAnnouncementsQuery,
} from "../validators/announcements.validator.ts";
import logger from "../logger.ts";

const limit = 10; // Number of announcements per page

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

export const createAnnouncement = async (
  req: Request<{}, {}, AnnouncementBody>,
  res: Response,
) => {
  const { title, description, price, category, authorId } = req.body;
  logger.info(`Creating announcement for author ID: ${authorId}`);
  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      price,
      category,
      authorId,
    },
  });
  logger.info(`Announcement created with ID: ${announcement.id}`);
  res.status(201).json(announcement);
};

export const updateAnnouncement = async (
  req: Request<AnnouncementParams, {}, AnnouncementBody>,
  res: Response,
) => {
  const { id } = req.params;
  const { title, description, price, category } = req.body;

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
