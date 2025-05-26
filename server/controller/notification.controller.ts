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
        status: "unread"
      });

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalNotifications / Number(limit)),
          totalNotifications,
          unreadCount
        }
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// @desc    Get all notifications
// @route   GET /api/get-all-notifications
// @access  Private (Admin only)
export const getAllNotifications = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return next(new ErrorHandler("Access denied. Admin role required.", 403));
      }

      const { page = 1, limit = 20 } = req.query;
      
      const notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate("userId", "name email");

      const totalNotifications = await Notification.countDocuments();

      res.status(200).json({
        success: true,
        notifications,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalNotifications / Number(limit)),
          totalNotifications
        }
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
      const notificationId = req.params.id;
      const userId = req.user._id;

      // For non-admin users, ensure they can only update their own notifications
      const filter = req.user.role === "admin" 
        ? { _id: notificationId }
        : { _id: notificationId, userId };

      const notification = await Notification.findOne(filter);
      
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      notification.status = "read";
      await notification.save();

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
        notification
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// @desc    Mark all notifications as read for current user
// @route   PUT /api/v1/mark-all-notifications
// @access  Private
export const markAllNotificationsAsRead = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;

      await Notification.updateMany(
        { userId, status: "unread" },
        { status: "read" }
      );

      const unreadCount = await Notification.countDocuments({ 
        userId, 
        status: "unread"
      });

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        unreadCount
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
      const notificationId = req.params.id;
      const userId = req.user._id;

      // For non-admin users, ensure they can only delete their own notifications
      const filter = req.user.role === "admin" 
        ? { _id: notificationId }
        : { _id: notificationId, userId };

      const notification = await Notification.findOne(filter);
      
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      await Notification.findByIdAndDelete(notificationId);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully"
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// @desc    Get notification statistics
// @route   GET /api/v1/get-notification-stats
// @access  Private (Admin only)
export const getNotificationStats = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.user.role !== "admin") {
        return next(new ErrorHandler("Access denied. Admin role required.", 403));
      }

      const totalNotifications = await Notification.countDocuments();
      const readNotifications = await Notification.countDocuments({ status: "read" });
      const unreadNotifications = await Notification.countDocuments({ status: "unread" });

      // Get notification distribution by type (based on title patterns)
      const notificationTypes = await Notification.aggregate([
        {
          $group: {
            _id: {
              $cond: [
                { $regexMatch: { input: "$title", regex: /Task.*Assigned/i } },
                "Task Assignment",
                {
                  $cond: [
                    { $regexMatch: { input: "$title", regex: /Task.*Updated/i } },
                    "Task Update",
                    {
                      $cond: [
                        { $regexMatch: { input: "$title", regex: /Task.*Completed/i } },
                        "Task Completion",
                        "Other"
                      ]
                    }
                  ]
                }
              ]
            },
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        stats: {
          total: totalNotifications,
          read: readNotifications,
          unread: unreadNotifications,
          typeDistribution: notificationTypes
        }
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

// Helper function to create notifications (to be used by other controllers)
export const createNotification = async (
  userId: string,
  title: string,
  message: string
) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      status: "unread" // Set default status
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};