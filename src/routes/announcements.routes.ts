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
import { upload } from "../middleware/upload.ts";

const router = Router();

router.get(
  "/",
  validateQuery(GetAnnouncementsQuerySchema),
  getAllAnnouncements,
);

router.get("/:id", getAnnouncementById);

router.post(
  "/",
  upload.single("image"),
  validateBody(CreateAnnouncementSchema),
  authenticate,
  createAnnouncement,
);

router.patch(
  "/:id",
  upload.single("image") as any,
  validateBody(UpdateAmouncementSchema),
  validateParams(AnnouncementParamsSchema),
  authenticate,
  updateAnnouncement,
);

router.delete(
  "/:id",
  validateParams(AnnouncementParamsSchema),
  authenticate,
  deleteAnnouncement,
);

export default router;
