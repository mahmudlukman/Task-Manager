import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../controller/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get(
  "/get-user-notifications",
  isAuthenticated,
  getUserNotifications
);
notificationRouter.put(
  "/mark-as-read/:id",
  isAuthenticated,
  markNotificationAsRead
);
notificationRouter.delete(
  "/delete-notification/:id",
  isAuthenticated,
  deleteNotification
);

export default notificationRouter;
