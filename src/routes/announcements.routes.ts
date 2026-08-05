import { Router } from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
} from "../controllers/announcements.controller.ts";
import {
  AnnouncementParamsSchema,
  CreateAnnouncementSchema,
  GetAnnouncementsQuerySchema,
  UpdateAmouncementSchema,
} from "../validators/announcements.validator.ts";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validate.ts";
import authenticate from "../middleware/authenticate.ts";
import { upload, uploadToCloudinary } from "../middleware/upload.ts";

const router = Router();

router.get(
  "/",
  validateQuery(GetAnnouncementsQuerySchema),
  getAllAnnouncements,
);

router.get("/:id", getAnnouncementById);

router.post(
  "/",
  authenticate,
  upload.single("image"),
  uploadToCloudinary,
  validateBody(CreateAnnouncementSchema),
  createAnnouncement,
);

router.patch(
  "/:id",
  authenticate,
  upload.single("image"),
  validateParams(AnnouncementParamsSchema) as any,
  uploadToCloudinary,
  validateBody(UpdateAmouncementSchema),
  updateAnnouncement as any,
);

router.delete(
  "/:id",
  validateParams(AnnouncementParamsSchema),
  authenticate,
  deleteAnnouncement,
);

export default router;
