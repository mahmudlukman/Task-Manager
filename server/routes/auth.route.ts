import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/auth.controller";
import { isAuthenticated } from "../middleware/auth";
const authRouter = express.Router();

authRouter.post("/register-user", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/logout", isAuthenticated, logoutUser);

export default authRouter;
