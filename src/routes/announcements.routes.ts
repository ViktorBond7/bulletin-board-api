import { Router } from "express";
import {
  createAnnouncement,
  getAllAnnouncements,
} from "../controllers/announcements.controller.ts";
import {
  AnnouncementSchema,
  GetAnnouncementsQuerySchema,
} from "../validators/announcements.validator.ts";
import { validateBody, validateQuery } from "../middleware/validate.ts";

// import { RegisterSchema, LoginSchema } from "../validators/auth.validator.ts";
// import { validateBody } from "../middleware/validate.ts";
// import authenticate from "../middleware/authenticate.ts";

const router = Router();

router.get(
  "/",
  validateQuery(GetAnnouncementsQuerySchema),
  getAllAnnouncements,
);

router.post("/", validateBody(AnnouncementSchema), createAnnouncement);

export default router;
