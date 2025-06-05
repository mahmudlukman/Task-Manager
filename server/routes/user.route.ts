import express from "express";
import {
  deleteUser,
  getLoggedInUser,
  getUserById,
  getUsers,
  restoreUser,
  updateUser,
  updateUserStatus,
} from "../controller/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.get("/me", isAuthenticated, getLoggedInUser);
userRouter.get("/user/:userId", isAuthenticated, getUserById);
userRouter.get("/users", isAuthenticated, authorizeRoles("admin"), getUsers);
userRouter.put("/update-user", isAuthenticated, updateUser);
userRouter.put("/update-user-status", isAuthenticated, authorizeRoles("admin"), updateUserStatus);
userRouter.delete("/delete/:userId", isAuthenticated, authorizeRoles("admin"), deleteUser);
userRouter.put("/restore/:userId", isAuthenticated, authorizeRoles("admin"), restoreUser);

export default userRouter;
