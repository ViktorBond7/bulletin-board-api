import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import { Prisma } from "../../generated/prisma/browser.ts";

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

export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, description, price, category, authorId } = req.body;
  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      price,
      category,
      authorId,
    },
  });

  res.status(201).json(announcement);
};
