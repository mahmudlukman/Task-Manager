import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import compression from "compression";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import taskRouter from "./routes/task.route";
import reportRouter from "./routes/report.route";
import notificationRouter from "./routes/notification.route";
import limiter from "./utils/rateLimiter";

export const app = express();
//config
dotenv.config();

//body parser

app.use(express.json({ limit: "50mb" }));

//cookie parser

app.use(cookieParser());

//cors=>cross origin resource sharing

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Enable response compression to reduce payload size and improve performance
app.use(
  compression({
    threshold: 1024, // Only compress responses larger than 1KB
  })
);

// Use Helmet to enhance security by setting various HTTP headers
app.use(helmet());

// Apply rate limiting middleware to prevent excessive requests and enhance security
app.use(limiter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/docs.json", (req, res) => {
  res.json(swaggerDocument);
});

//routes
app.use(
  "/api/v1",
  authRouter,
  userRouter,
  taskRouter,
  reportRouter,
  notificationRouter
);

//testing route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.use(ErrorMiddleware);
