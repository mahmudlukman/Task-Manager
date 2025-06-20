require("dotenv").config();
import User from "../model/User.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { IGetAllUsers, UpdateUserParams } from "../@types";
import cloudinary from "cloudinary";
import Task from "../model/Task.model";
import { FilterQuery } from "mongoose";

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

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private (Admin only)
export const getUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        pageSize = 20,
        filter,
        searchQuery,
      } = req.query as IGetAllUsers;

      const skipAmount = (page - 1) * pageSize;

      const query: FilterQuery<typeof User> = {};

      if (searchQuery) {
        const escapedSearchQuery = searchQuery.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        query.$or = [{ name: { $regex: new RegExp(escapedSearchQuery, "i") } }];
      }

      // Fetch all users, excluding password
      const users = await User.find(query)
        .skip(skipAmount)
        .limit(pageSize)
        .select("-password");

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

      const totalUsers = await User.countDocuments(query);
      const isNext = totalUsers > skipAmount + users.length;

      res.status(200).json({
        success: true,
        users, // All users
        usersWithTaskCounts: filteredUsersWithTaskCounts, // Only users with tasks
        isNext,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Update user profile
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

// @desc    Update user status and role
// @route   GET /api/v1/update-user-status
// @access  Private (Admin)
export const updateUserStatus = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role, isActive } = req.body;
      const user = await User.findById(id);

      if (!user) {
        return next(new ErrorHandler(`User not found: ${id}`, 404));
      }

      if (user.deletedAt) {
        return next(
          new ErrorHandler("Cannot update a user marked for deletion", 400)
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { role, isActive },
        { new: true }
      );
      res.status(201).json({
        success: true,
        user: updatedUser,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Delete user and all associated data (tasks, attachments)
// @route   DELETE /api/v1/users/:userId
// @access  Private (Admin only)
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return next(new ErrorHandler("Missing user ID", 400));
      }

      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler(`User not found: ${userId}`, 404));
      }

      // Prevent admin from soft-deleting themselves
      if (req.user?._id.toString() === userId) {
        return next(new ErrorHandler("Cannot delete your own account", 403));
      }

      // Mark user for deletion
      user.isActive = false;
      user.deletedAt = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        message:
          "User marked for deletion. Will be permanently deleted after 30 days.",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// @desc    Restore a soft-deleted user
// @route   PATCH /api/v1/users/restore/:userId
// @access  Private (Admin only)
export const restoreUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return next(new ErrorHandler("Missing user ID", 400));
      }

      const user = await User.findById(userId);

      if (!user) {
        return next(new ErrorHandler(`User not found: ${userId}`, 404));
      }

      if (!user.deletedAt) {
        return next(new ErrorHandler("User is not marked for deletion", 400));
      }

      // Check if 30 days have not elapsed
      const deletionDate = new Date(user.deletedAt);
      const now = new Date();
      const daysSinceDeletion =
        (now.getTime() - deletionDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceDeletion > 30) {
        return next(
          new ErrorHandler(
            "Cannot restore user: 30-day restoration period has expired",
            400
          )
        );
      }

      // Restore user
      user.isActive = true;
      user.deletedAt = null;
      await user.save();

      res.status(200).json({
        success: true,
        message: "User restored successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
