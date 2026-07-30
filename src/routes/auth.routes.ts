import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
} from "../controllers/auth.controller.ts";
import { RegisterSchema, LoginSchema } from "../validators/auth.validator.ts";
import { validateBody } from "../middleware/validate.ts";
import authenticate from "../middleware/authenticate.ts";

const router = Router();

router.post("/register", validateBody(RegisterSchema), register);
router.post("/login", validateBody(LoginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);

export default router;
