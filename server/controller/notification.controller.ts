import Notification from "../model/Notification.model";
import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/errorHandler";
import cron from "node-cron";

// @desc    Get notifications for the current user
// @route   GET /api/v1/get-user-notifications
// @access  Private
export const getUserNotifications = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user._id;

      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const totalNotifications = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({
        userId,
        status: "unread",
      });

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalNotifications / Number(limit)),
          totalNotifications,
          unreadCount,
        },
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// @desc    Mark notification as read
// @route   PUT /api/v1/mark-as-read
// @access  Private
export const markNotificationAsRead = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }

      await notification.save();

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// @desc    Delete notification (user can delete their own, admin can delete any)
// @route   DELETE /api/v1/delete-notification
// @access  Private
export const deleteNotification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      await Notification.findByIdAndDelete(notification);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// Cleanup old read notifications (runs daily at midnight)
cron.schedule("0 0 0 * * *", async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Notification.deleteMany({
      status: "read",
      createdAt: { $lt: thirtyDaysAgo },
    });

    console.log(`Deleted ${result.deletedCount} old read notifications`);
  } catch (error) {
    console.error("Error during notification cleanup:", error);
  }
});
