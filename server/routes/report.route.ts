import express from "express";
import { exportUsersReport } from "../controller/report.controller";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const reportRouter = express.Router();

reportRouter.get(
  "/export/tasks",
  isAuthenticated,
  authorizeRoles("admin"),
  exportUsersReport
);
reportRouter.get(
  "/export/users",
  isAuthenticated,
  authorizeRoles("admin"),
  exportUsersReport
);

export default reportRouter;
