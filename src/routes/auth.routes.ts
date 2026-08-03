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
router.post("/logout", authenticate, strictLimiter, logout);
router.get("/me", authenticate, strictLimiter, getCurrentUser);

export default router;

// Rate limiter підключається лише до auth роутера, а не до всього застосунку.
// Імпортуйте його в auth.routes.ts і застосуйте до всіх маршрутів цього роутера.
