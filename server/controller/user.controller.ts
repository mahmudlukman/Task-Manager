require("dotenv").config();
import User from "../model/User.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { UpdateUserParams } from "../@types";
import cloudinary from "cloudinary";
import Task from "../model/Task.model";
import { deleteAttachmentsFromCloudinary } from "./task.controller";

// @desc    Get logged in user profile
// @route   GET /api/v1/me
// @access  Private (Requires access token)
export const getLoggedInUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId).select("-password");
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get user profile
// @route   GET /api/v1/user/:userId
// @access  Private
export const getUserById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get all users (Admin only)
// @route   GET /api/users/
// @access  Private (Admin)
export const getUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch all users, excluding password
      const users = await User.find().select("-password");

      // Add task counts to each user and filter those with tasks
      const usersWithTaskCounts = await Promise.all(
        users.map(async (user) => {
          const pendingTasks = await Task.countDocuments({
            assignedTo: user._id,
            status: "Pending",
          });
          const inProgressTasks = await Task.countDocuments({
            assignedTo: user._id,
            status: "In Progress",
          });
          const completedTasks = await Task.countDocuments({
            assignedTo: user._id,
            status: "Completed",
          });

          // Only include users with at least one task
          if (pendingTasks > 0 || inProgressTasks > 0 || completedTasks > 0) {
            return {
              ...user.toObject(), // Include all existing user data
              pendingTasks,
              inProgressTasks,
              completedTasks,
            };
          }
          return null; // Exclude users with zero tasks
        })
      );

      // Filter out null entries from usersWithTaskCounts
      const filteredUsersWithTaskCounts = usersWithTaskCounts.filter(
        (user) => user !== null
      );

      res.status(200).json({
        success: true,
        users, // All users
        usersWithTaskCounts: filteredUsersWithTaskCounts, // Only users with tasks
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// export const getUsers = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const users = await User.find().select("-password");

//       // Add task counts to each user
//       const usersWithTaskCounts = await Promise.all(
//         users.map(async (user) => {
//           const pendingTasks = await Task.countDocuments({
//             assignedTo: user._id,
//             status: "Pending",
//           });
//           const inProgressTasks = await Task.countDocuments({
//             assignedTo: user._id,
//             status: "In Progress",
//           });
//           const completedTasks = await Task.countDocuments({
//             assignedTo: user._id,
//             status: "Completed",
//           });

//           return {
//             ...user.toObject(), // Include all existing user data
//             pendingTasks,
//             inProgressTasks,
//             completedTasks,
//           };
//         })
//       );

//       res.status(200).json({ success: true, users, usersWithTaskCounts });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// @desc    Get user profile
// @route   GET /api/v1/update-user/
// @access  Private
export const updateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, avatar }: UpdateUserParams = req.body;
      const userId = req.user?._id;
      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      if (name) user.name = name;

      if (avatar && avatar !== user.avatar?.url) {
        if (user.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatar",
          width: 150,
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Get user profile
// @route   GET /api/v1/update-user-role
// @access  Private (Admin)
export const updateUserRole = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      const user = await User.findByIdAndUpdate(id, { role }, { new: true });
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Delete user and all associated data (tasks, attachments)
// @route   DELETE /api/users/:userId
// @access  Private (Admin only)
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return next(new ErrorHandler("Missing user ID", 400));
      }

      const user = await User.findByIdAndDelete(userId);

      if (!user) {
        return next(new ErrorHandler(`User not found: ${userId}`, 404));
      }
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// export const deleteUser = catchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId } = req.params;

//       // Check if the user exists
//       const user = await User.findById(userId);

//       if (!user) {
//         return next(new ErrorHandler("User not found", 404));
//       }

//       // Find all tasks assigned to the user
//       const userTasks = await Task.find({ assignedTo: userId });

//       // Delete all task attachments from Cloudinary
//       for (const task of userTasks) {
//         if (task.attachments && task.attachments.length > 0) {
//           await deleteAttachmentsFromCloudinary(task.attachments);
//         }
//       }

//       // Delete user's avatar from Cloudinary if it exists
//       if (user.avatar && user.avatar.public_id) {
//         await cloudinary.v2.uploader.destroy(user.avatar.public_id);
//       }

//       // Delete all tasks associated with the user
//       await Task.deleteMany({ assignedTo: userId });

//       // Finally, delete the user
//       await User.findByIdAndDelete(userId);

//       res.status(200).json({
//         success: true,
//         message: "User and all associated data deleted successfully",
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
