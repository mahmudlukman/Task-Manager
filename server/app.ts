import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import dotenv from "dotenv";
import userRouter from "./routes/user.route";

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
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

//routes
app.use("/api/v1", userRouter);

//testing route
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

app.use(ErrorMiddleware);
