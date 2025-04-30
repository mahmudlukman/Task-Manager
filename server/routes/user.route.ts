import express from "express";
// import {
//   deleteUser,
//   getLoggedInUser,
//   getUserById,
//   updateUser,
// } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

// userRouter.get("/me", isAuthenticated, getLoggedInUser);
// userRouter.get("/user/:userId", isAuthenticated, getUserById);
// userRouter.put("/update-user/", isAuthenticated, updateUser);
// userRouter.delete("/delete/:userId", isAuthenticated, deleteUser);

export default userRouter;
