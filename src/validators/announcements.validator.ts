import { z } from "zod";
import { registry } from "../openapi.ts";

export const GetAnnouncementsQuerySchema = registry.register(
  "GetAnnouncementsQuery",
  z.object({
    page: z.coerce.number().int().min(1).optional(),
    sort: z.enum(["newest", "oldest"]).default("newest"),
    search: z.string().min(1).max(50).optional(),
  }),
);

export const AnnouncementSchema = registry.register(
  "Announcement",
  z.object({
    title: z.string().min(5).max(50),
    description: z.string().min(10),
    price: z.number().positive(),
    category: z.enum(["sale", "service", "job", "other"]),
    authorId: z.number().int(),
  }),
);
7;
