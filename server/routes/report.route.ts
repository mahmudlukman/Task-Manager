import express from "express";
import { exportTasksReport, exportUsersReport } from "../controller/report.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const reportRouter = express.Router();

reportRouter.get(
  "/export/tasks",
  isAuthenticated,
  authorizeRoles("admin"),
  exportTasksReport
);
reportRouter.get(
  "/export/users",
  isAuthenticated,
  authorizeRoles("admin"),
  exportUsersReport
);

export default reportRouter;
