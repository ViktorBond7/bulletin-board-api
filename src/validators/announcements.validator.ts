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

export const CreateAnnouncementSchema = registry.register(
  "CreateAnnouncement",
  z.object({
    title: z.string().min(5).max(50),
    description: z.string().min(10),
    price: z.coerce.number().positive(),
    category: z.enum(["sale", "service", "job", "other"]),
    authorId: z.coerce.number().int(),
    image: z.any().optional().openapi({
      type: "string",
      format: "binary",
    }),
  }),
);

export const AnnouncementParamsSchema = registry.register(
  "AnnouncementParams",
  z.object({
    id: z.coerce.number().int().positive(),
  }),
);

export const UpdateAmouncementSchema = registry.register(
  "UpdateAnnouncement",
  CreateAnnouncementSchema.partial(),
);

export type GetAnnouncementsQuery = z.infer<typeof GetAnnouncementsQuerySchema>;
export type AnnouncementBody = z.infer<typeof CreateAnnouncementSchema>;
export type AnnouncementParams = z.infer<typeof AnnouncementParamsSchema>;
export type UpdateAnnouncementBody = z.infer<typeof UpdateAmouncementSchema>;

registry.registerPath({
  method: "get",
  path: "/announcements",
  request: {
    query: GetAnnouncementsQuerySchema,
  },
  tags: ["Announcements"],
  summary:
    "Get all announcements with optional pagination, sorting, and search",
  responses: {
    200: { description: "List of announcements" },
    400: { description: "Invalid query parameters" },
  },
});

registry.registerPath({
  method: "get",
  path: "/announcements/{id}",
  request: {
    params: AnnouncementParamsSchema,
  },
  tags: ["Announcements"],
  summary: "Get an announcement by ID",
  responses: {
    200: { description: "Announcement details" },
    404: { description: "Announcement not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/announcements",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: CreateAnnouncementSchema,
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: ["Announcements"],
  summary: "Create a new announcement",
  responses: {
    201: { description: "Announcement created successfully" },
    400: { description: "Invalid request body" },
    401: { description: "Authentication required" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/announcements/{id}",
  request: {
    params: AnnouncementParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: UpdateAmouncementSchema,
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: ["Announcements"],
  summary: "Update an existing announcement",
  responses: {
    200: { description: "Announcement updated successfully" },
    400: { description: "Invalid request body" },
    401: { description: "Authentication required" },
    403: { description: "Access denied" },
    404: { description: "Announcement not found" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/announcements/{id}",
  request: {
    params: AnnouncementParamsSchema,
  },
  security: [{ bearerAuth: [] }],
  tags: ["Announcements"],
  summary: "Delete an announcement by ID",
  responses: {
    204: { description: "Announcement deleted successfully" },
    401: { description: "Authentication required" },
    403: { description: "Access denied" },
    404: { description: "Announcement not found" },
  },
});
