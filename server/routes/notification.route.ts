import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  deleteNotification,
  getAllNotifications,
  getNotificationStats,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controller/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/get-user-notifications",
  isAuthenticated,
  getUserNotifications
);
notificationRouter.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllNotifications
);
notificationRouter.put(
  "/mark-as-read/:id",
  isAuthenticated,
  markNotificationAsRead
);
notificationRouter.put(
  "/mark-all-notifications",
  isAuthenticated,
  markAllNotificationsAsRead
);
notificationRouter.delete(
  "/delete-notification",
  isAuthenticated,
  deleteNotification
);
notificationRouter.get(
  "/get-notification-stats",
  isAuthenticated,
  getNotificationStats
);

export default notificationRouter;
