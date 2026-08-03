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
import strictLimiter from "../middleware/rateLimiter.ts";

const router = Router();

router.post("/register", validateBody(RegisterSchema), strictLimiter, register);
router.post("/login", validateBody(LoginSchema), strictLimiter, login);
router.post("/refresh", strictLimiter, refresh);
router.post("/logout", strictLimiter, logout);
router.get("/me", authenticate, strictLimiter, getCurrentUser);

export default router;
