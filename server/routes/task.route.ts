import express from "express";
import {
  createTask,
  deleteTask,
  deleteTaskAttachment,
  getDashboardData,
  getTask,
  getTasks,
  getUserDashboardData,
  updateTask,
  updateTaskAttachments,
  updateTaskChecklist,
  updateTaskStatus,
} from "../controller/task.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const taskRouter = express.Router();

taskRouter.get("/tasks", isAuthenticated, getTasks); // Get all tasks (Admin: all, User: assigned)
taskRouter.get("/task/:id", isAuthenticated, getTask); // Get task by ID
taskRouter.post(
  "/create-task",
  isAuthenticated,
  authorizeRoles("admin"),
  createTask
); // Create a task (Admin only)
taskRouter.put("/update-task/:id", isAuthenticated, updateTask); // Update task details
taskRouter.delete(
  "/delete-task/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteTask
); // Delete a task (Admin only)
taskRouter.put("/status/:id", isAuthenticated, updateTaskStatus); // Update task status
taskRouter.put("/todo/:id", isAuthenticated, updateTaskChecklist); // Update task checklist
taskRouter.put(
  "/task/:id/attachments",
  isAuthenticated,
  authorizeRoles("admin"),
  updateTaskAttachments
); // Update task attachments (Admin only)
taskRouter.delete(
  "/task/:id/attachments/:attachmentId",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteTaskAttachment
); // delete task attachments (Admin only)
taskRouter.get("/dashboard-data", isAuthenticated, getDashboardData); // Get dashboard data (Admin only)
taskRouter.get("/user-dashboard-data", isAuthenticated, getUserDashboardData);

export default taskRouter;
