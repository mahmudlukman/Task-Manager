require("dotenv").config();
import User from "../model/User.model";
import ErrorHandler from "../utils/errorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import { NextFunction, Request, Response } from "express";
import { UpdateUserParams } from "../@types";
import cloudinary from "cloudinary";

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
      const users = await User.find({ role: "member" }).select("-password");

      // Add task counts to each user
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

          return {
            ...user.toObject(), // Include all existing user data
            pendingTasks,
            inProgressTasks,
            completedTasks,
          };
        })
      );

      res.status(200).json({ success: true, usersWithTaskCounts });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

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
// @route   GET /api/v1/update-user/
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

// delete user
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      // Unlink relationships
      await Promise.all([
        Event.updateMany(
          { _id: { $in: user.events } },
          { $pull: { organizer: user._id } }
        ),

        // Update the 'orders' collection to remove references to the user
        Order.updateMany(
          { _id: { $in: user.orders } },
          { $unset: { buyer: 1 } }
        ),
      ]);

      // Delete user
      const deletedUser = await User.findByIdAndDelete(user._id);
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully!" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
