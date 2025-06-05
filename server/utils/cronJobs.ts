import cron from "node-cron";
import User from "../model/User.model";
import Notification from "../model/Notification.model";

/**
 * This cron job runs every day at midnight to permanently delete notifications
 * that are marked as read and created more than 30 days ago.
 */
export const scheduleNotificationsCleanup = () => {
  // Run every day at midnight
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
};

/**
 * This cron job runs every day at midnight to permanently delete users
 * who have been marked for deletion (deletedAt field) for more than 30 days.
 */
export const scheduleUserCleanup = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Find and delete users marked for deletion more than 30 days ago
      const result = await User.deleteMany({
        deletedAt: { $lte: thirtyDaysAgo },
      });

      console.log(`Permanently deleted ${result.deletedCount} users`);
    } catch (error) {
      console.error("Error in user cleanup cron job:", error);
    }
  });
};
