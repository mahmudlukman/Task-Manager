import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller";
import { isAuthenticated } from "../middleware/auth";
import limiter from "../utils/rateLimiter";
const authRouter = express.Router();

authRouter.post("/register", limiter, registerUser);
authRouter.post("/login", limiter, loginUser);
authRouter.get("/logout", isAuthenticated, logoutUser);

export default authRouter;
