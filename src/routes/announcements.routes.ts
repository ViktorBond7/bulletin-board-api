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

// import { RegisterSchema, LoginSchema } from "../validators/auth.validator.ts";
// import { validateBody } from "../middleware/validate.ts";
// import authenticate from "../middleware/authenticate.ts";

const router = Router();

router.get(
  "/",
  validateQuery(GetAnnouncementsQuerySchema),
  getAllAnnouncements,
);

router.get("/:id", getAnnouncementById); // Placeholder for getting a single announcement by ID

router.post(
  "/",
  authenticate,
  validateBody(CreateAnnouncementSchema),
  createAnnouncement,
);

router.patch(
  "/:id",
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
