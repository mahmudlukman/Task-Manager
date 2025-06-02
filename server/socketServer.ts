import { Server as SocketIOServer } from "socket.io";
import http from "http";
import { setSocketServer } from "./controller/task.controller";

export const initSocketServer = (server: http.Server) => {
  console.log("Initializing Socket.IO server");
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  // Set the Socket.IO instance for use in other modules
  setSocketServer(io);

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on("notification", (data: any) => {
      io.to(data.userId).emit("newNotification", data);
      console.log(`Notification sent to user ${data.userId}:`, data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};