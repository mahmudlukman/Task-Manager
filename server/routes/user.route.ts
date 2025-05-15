import express from "express";
import {
  deleteUser,
  getLoggedInUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserRole,
} from "../controller/user.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.get("/me", isAuthenticated, getLoggedInUser);
userRouter.get("/user/:userId", isAuthenticated, getUserById);
userRouter.get("/users", isAuthenticated, authorizeRoles("admin"), getUsers);
userRouter.put("/update-user", isAuthenticated, updateUser);
userRouter.put("/update-user-role", isAuthenticated, authorizeRoles("admin"), updateUserRole);
userRouter.delete("/delete/:userId", isAuthenticated, authorizeRoles("admin"), deleteUser);

export default userRouter;
